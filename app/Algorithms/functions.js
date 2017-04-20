const promiseQueue        = require('promise-queue');
const corefConnection     = [];
const relConnection       = [];
const eventConnection     = [];
const callQueue           = new promiseQueue(1, Infinity);
const config              = require('./config.js');
const request             = require('request');
const cliConfig           = require ('../Cli/config.js')
const dbConnection        = require('../DbConnection/functions.js');
const algorithmStatus     = {};

/*
 * Initializes the promise queues for each algorithm
 */
for(let algoLocation of cliConfig.coRefAlgorithms) {
  corefConnection.push({
    location: algoLocation,
    queue: new promiseQueue(config.coRefAlgorithms.parallelRequests, Infinity)
  });
  algorithmStatus[algoLocation] = { count: 0, error:0 };
}
for(let algoLocation of cliConfig.relAlgorithms) {
  relConnection.push({
    location: algoLocation,
    queue: new promiseQueue(config.relAlgorithms.parallelRequests, Infinity)
  });
  algorithmStatus[algoLocation] = { count: 0, error:0 };
}
for(let algoLocation of cliConfig.eventAlgorithms) {
  eventConnection.push({
    location: algoLocation,
    queue: new promiseQueue(config.eventAlgorithms.parallelRequests, Infinity)
  });
  algorithmStatus[algoLocation] = { count: 0, error:0 };
}

/**
 * Process website:
 * - Call CoRef
 * - Get replaced text
 * - Call other algorithms
 * @param websites content of the websites, as a string or as an array
 */
module.exports.call = function (websites) {
  if (!(websites instanceof Array)) {
    // websites has to be an array
    websites = [websites];
  }
  // multiple websites
  websites.forEach(website => {
    // do the algorithm calls
    if (website) {
      callQueue.add(() => callChain(website));
    }
  });
};

function callChain(websiteContent) {
  return new Promise((resolve) => {
    for(let coref of corefConnection) {
      const callerLog = 'CoRef(' + coref.location + ')';

      console.log('Call ' + callerLog);
      coref.queue.add(() => postRequest(coref.location, websiteContent, config.coRefAlgorithms.timeOut))
        .catch((error) => {
          // first catch the error, then work on in then()
          algorithmStatus[coref.location].error++;
          console.error(callerLog + ': ' + error);
        }).then((replacedCorefs) => {
        algorithmStatus[coref.location].count++;
        if (!replacedCorefs) {
          // previous error, or no data from coref, let's just use the websiteContent data from before
          console.log(callerLog + ': We will work on with the old data, because the there was a problem with the algorithm');
          replacedCorefs = websiteContent;
        } else {
          console.log(callerLog + ': Finished, replaced text');
        }
        // call all given relationship algorithms
        for(let rel of relConnection) {
          callAlgorithm(replacedCorefs, rel, 'Relationships', config.relAlgorithms.timeOut, dbConnection.writeRelationships);
        }
        // call all given date extraction algorithms
        for(let date of eventConnection) {
          callAlgorithm(replacedCorefs, date, 'DateExtraction', config.eventAlgorithms.timeOut, dbConnection.writeEvents);

        }

        // resolve here to call the next CoRef as the other algorithms still run
        resolve();
      });
    }
    // we didn't call CoRef algorithm, but still want to call the other algorithms
    if (corefConnection.length === 0) {
      // call all given relationship algorithms
      for(let rel of relConnection) {
        callAlgorithm(websiteContent, rel, 'Relationships', config.relAlgorithms.timeOut, dbConnection.writeRelationships);
      }
      // call all given date extraction algorithms
      for(let date of eventConnection) {
        callAlgorithm(websiteContent, date, 'DateExtraction', config.eventAlgorithms.timeOut, dbConnection.writeEvents);
      }
    }

    // resolve here to call the next CoRef as the other algorithms still run
    resolve();
  });
}


/**
 * Calls the given algorithm in the given queue with the given data and handles the response.
 *
 * @param websiteContent content of the given website, should be a string
 * @param algorithm the algorithm which we want to call, should contain .location and .queue
 * @param algorithmType the type of the algorithm to call, should be a string, only used for logging
 * @param timeout the timeout after which we cancel the request
 * @param write the function to which to pass the response
 */
function callAlgorithm(websiteContent, algorithm, algorithmType, timeout, write) {
  const callerLog = algorithmType + '(' + algorithm.location + ')';

  console.log('Call ' + callerLog);
  algorithm.queue.add(() => postRequest(algorithm.location, websiteContent, timeout))
    .then(result => {
        algorithmStatus[algorithm.location].count++;

        if (result) {
          if (typeof(result) === 'string') {
            console.log(callerLog + ': Result is a String: ' + result);
          } else {
            // write to db
            console.log(callerLog + ': Write JSON to DB');
            write(result);
          }
        } else {
          console.log(callerLog + ': Finished, but result was ' + result);
        }
      },
      error => {
        algorithmStatus[algorithm.location].count++;
        algorithmStatus[algorithm.location].error++;
        console.error(callerLog + ': ' + error);
      });
}

/**
 * Does the real algorithm call. Sends a POST request to the given URL
 *
 * @param algorithmLocation location of the url to call
 * @param websiteContent the content of the website which we want to analyse
 * @param timeout the timeout after which we cancel the request
 * @returns {Promise}
 */
function postRequest(algorithmLocation, websiteContent, timeout) {
  return new Promise((resolve, reject) => {
    const url = 'http://' + algorithmLocation;
    console.log('URL: ' + url);
    request(
      {
        url: url,
        method: 'POST',
        json: true,
        headers: {
          'Content-type': 'application/json',
        },
        body: {'inputText': websiteContent},
        timeout: timeout
      },
      (error, res) => {
        if (error) {
          reject(error);
        }
        if (res) {
          resolve(res.body);
        } else {
          reject();
        }
      });
  });
}

module.exports.callSemilar = function (text1, text2) {
  return new Promise((resolve, reject) => {
    const url = 'http://' + cliConfig.semilarAlgorithm + "?text1=" + encodeURI(text1) + "&text2=" + encodeURI(text2);
    request(
      {
        url: url,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: config.semilar.timeOut
      },
      (error, res) => {
        if (error) {
          reject(error);
        }
        if (res && res.body !== 'NaN') {
          resolve(res.body);
        } else {
          resolve(0);
        }
      });
  });
};

module.exports.status = function() {
  return algorithmStatus;
};
