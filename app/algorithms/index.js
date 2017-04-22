const promiseQueue        = require('promise-queue');
const corefConnection     = [];
const relConnection       = [];
const eventConnection     = [];
const callQueue           = new promiseQueue(1, Infinity);
const config              = require('./config.js');
const request             = require('request');
const cliConfig           = require ('../cli/config.js');
const dbConnection        = require('../dbConnection');
const algorithmStatus     = {};
const stringSearcher      = require('string-search');
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
module.exports.call = function (websites, header) {
  if (!(websites instanceof Array)) {
    // websites has to be an array
    websites = [websites];
    header = [header];
  }
  // multiple websites
  let websiteNum = 0;
  websites.forEach(website => {
    // do the algorithm callss
    if (website && header[websiteNum]) {
      let websiteContentHeader = {'content':website, 'header': header[websiteNum] };
      callQueue.add(() => callChain(websiteContentHeader ));
    }
    websiteNum++;
  });
};

function callChain(websiteContentHeader) {
  let websiteContent = websiteContentHeader.content;
  let header = websiteContentHeader.header;
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
          // now check here the header of the content and see whether this call is required or not
          /**
           * 1. Check the header is from Wikipedia
           * 2. Get the entity name from the wikipedia header
           * 3. If possible search here whether that entity exists or not in Db
           * 4. Otherwise pass that entity name to db write where it will be store the events against that entity in Db.
           * */
            parseHeader(header)
              .then(entity => {
                for (let date of eventConnection) {
                  callAlgorithmEvent(replacedCorefs, date, 'DateExtraction', config.eventAlgorithms.timeOut, dbConnection.writeEvents, entity);
                }
              }, error => {
                console.error(error);
              });
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
      // now check here the header of the content and see whether this call is required or not
      /**
       * 1. Check the header is from Wikipedia
       * 2. Get the entity name from the wikipedia header
       * 3. If possible search here whether that entity exists or not in Db
       * 4. Otherwise pass that entity name to db write where it will be store the events against that entity in Db.
       * */
        parseHeader(header)
          .then(entity => {
            for (let date of eventConnection) {
              callAlgorithmEvent(websiteContent, date, 'DateExtraction', config.eventAlgorithms.timeOut, dbConnection.writeEvents, entity);
            }
          }, error => {
            console.error(error);
          });
    }
    // resolve here to call the next CoRef as the other algorithms still run
    resolve();
  });
}

function parseHeader(header) {
    let entity = '';
    let findString = 'WARC-Target-URI: https://en.wikipedia.org/wiki/';
    return stringSearcher.find(header, findString)
      .then(function(resultArr) {
        //resultArr => [ {line: 1, text: 'This is the string to search text in'} ]
        if(resultArr[0].text)
        {
          let line = resultArr[0].text;
          entity = line.split(findString)[1];
          return entity;
        }
        throw new Error('no resultArr[0].text');
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
 * Calls the given algorithm date Event in the given queue with the given data and handles the response.
 *
 * @param websiteContent content of the given website, should be a string
 * @param algorithm the algorithm which we want to call, should contain .location and .queue
 * @param algorithmType the type of the algorithm to call, should be a string, only used for logging
 * @param timeout the timeout after which we cancel the request
 * @param write the function to which to pass the response
 * @param entity the entity for which these events are
 */
function callAlgorithmEvent(websiteContent, algorithm, algorithmType, timeout, write, entity) {
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
            let eventEntity = {'content': result, 'entity': entity};
            write(eventEntity);
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
