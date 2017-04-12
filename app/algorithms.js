const promiseQueue = require('promise-queue');

const corefQueues = [];
const relQueues = [];
const dateQueues = [];
const callQueue = new promiseQueue(1, Infinity);

const dbConnection = require('./dbConnection.js');
const config = require('./config');
const request = require('request');

/*
 * Initializes the promise queues for each algorithm
 */
for(let algoLocation of config.coRefAlgorithms) {
  corefQueues.push({
    location: algoLocation,
    queue: new promiseQueue(1, Infinity)
  });
}
for(let algoLocation of config.relAlgorithms) {
  relQueues.push({
    location: algoLocation,
    queue: new promiseQueue(1, Infinity)
  });
}
for(let algoLocation of config.dateAlgorithms) {
  dateQueues.push({
    location: algoLocation,
    queue: new promiseQueue(10, Infinity)
  });
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
    for(let coref of corefQueues) {
      const callerLog = 'CoRef(' + coref.location + ')';

      console.log('Call ' + callerLog);
      coref.queue.add(() => postRequest(coref.location, websiteContent, 120000))
        .catch((error) => {
          // first catch the error, then work on in then()
          console.error(callerLog + ': ' + error);
        }).then((replacedCorefs) => {
          if (!replacedCorefs) {
            // previous error, or no data from coref, let's just use the websiteContent data from before
            console.log(callerLog + ': We will work on with the old data, because the there was a problem with the algorithm');
            replacedCorefs = websiteContent;
          } else {
            console.log(callerLog + ': Finished, replaced text');
          }
          // call all given relationship algorithms
          for(let rel of relQueues) {
            callAlgorithm(replacedCorefs, rel, 'Relationships', 120000, dbConnection.writeRelationships);
          }
          // call all given date extraction algorithms
          for(let date of dateQueues) {
            callAlgorithm(replacedCorefs, date, 'DateExtraction', 10000, dbConnection.writeEvents);

          }

          // resolve here to call the next CoRef as the other algorithms still run
          resolve();
        });
    }
    // we didn't call CoRef algorithm, but still want to call the other algorithms
    if (corefQueues.length === 0) {
      // call all given relationship algorithms
      for(let rel of relQueues) {
        callAlgorithm(websiteContent, rel, 'Relationships', 120000, dbConnection.writeRelationships);
      }
      // call all given date extraction algorithms
      for(let date of dateQueues) {
        callAlgorithm(websiteContent, date, 'DateExtraction', 10000, dbConnection.writeEvents);
      }
    }
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
    const url = 'http://' + config.semilarAlgorithm + "?text1=" + encodeURI(text1) + "&text2=" + encodeURI(text2);
    console.log('URL: ' + url);
    request(
      {
        url: url,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      },
      (error, res) => {
        if (error) {
          reject(error);
        }
        if (res) {
          if (res.body !== 'NaN') {
            resolve(res.body);
          } else {
            reject();
          }
        } else {
          reject();
        }
      });
  });
};
