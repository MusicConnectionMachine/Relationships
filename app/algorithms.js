const promiseQueue = require('promise-queue');
const maxConcurrent = 1;
const maxQueue = Infinity;
const corefQueue = new promiseQueue(maxConcurrent, maxQueue);
const dateQueue = new promiseQueue(maxConcurrent, maxQueue);
const ollieQueue = new promiseQueue(maxConcurrent, maxQueue);
const openIeSQueue = new promiseQueue(maxConcurrent, maxQueue);
const openIeWQueue = new promiseQueue(maxConcurrent, maxQueue);
const callQueue = new promiseQueue(maxConcurrent, maxQueue);

const dbConnection = require('./dbConnection.js');
const config = require('../config');
const request = require('request');

// TODO: maybe refactor the queues after the code freeze

/**
 * Process website:
 * - Call CoRef
 * - Get replaced text
 * - Call other algorithms
 * @param websites
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

function callChain(website) {
  return new Promise((resolve) => {
    console.log('Call CoRef');
    corefQueue.add(() => call(config.algorithms.coreference_resolution, website))
      .catch((error) => {
        // first catch the error, then work on in then()
        console.error('CoRef: ' + error);
      }).then((replacedCorefs) => {
      if (!replacedCorefs) {
        // previous error, or no data from coref, let's just use the website data from before
        console.log('CoRef: Finished, but we will work on with the old data');
        replacedCorefs = website;
      } else {
        console.log('CoRef: Finished, replaced text');
      }
      let algorithms = [
        {
          name: 'Ollie',
          algo: config.algorithms.ollie,
          queue: ollieQueue,
          write: dbConnection.writeRelationships
        },
        {
          name: 'OpenIE S',
          algo: config.algorithms.openie_stanford,
          queue: openIeSQueue,
          write: dbConnection.writeRelationships
        },
        {
          name: 'OpenIE W',
          algo: config.algorithms.openie_washington,
          queue: openIeWQueue,
          write: dbConnection.writeRelationships
        },
        {
          name: 'DateEventExtraction',
          algo: config.algorithms.date_event_extraction,
          queue: openIeWQueue,
          write: dbConnection.writeEvents
        },
      ];

      for(let algorithm of algorithms) {
        console.log('Call ' + algorithm.name);
        algorithm.queue.add(() => call(algorithm.algo, replacedCorefs))
          .then(result => {
            if (result) {
              if (typeof(result) === 'string') {
                console.log(algorithm.name + ': Result is a String: ' + result);
              } else {
                // write to db
                console.log(algorithm.name + ': Write JSON to DB');
                algorithm.write(result);
              }
            } else {
              console.log(algorithm.name + ': Finished, but result was ' + result);
            }
          }, error => {
            console.error(algorithm.name + ': ' + error);
          });
      }

      // resolve here to call the next CoRef as the other algorithms still run
      resolve();
    });
  });
}

function call(algo, data) {
  return new Promise((resolve, reject) => {
    if (!algo.call) {
      // do not call, return the previous data
      reject('disabled');
      return;
    }
    const url = 'http://' + algo.host + ':' + algo.port + '/' + algo.path;
    console.log('URL: ' + url);
    request(
      {
        url: url,
        method: 'POST',
        json: true,
        headers: {
          'Content-type': 'application/json',
        },
        body: {'inputText': data},
        timeout: algo.timeout
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

function callDateEventExtraction(data) {
  const algo = config.algorithms.date_event_extraction;
  return new Promise((resolve, reject) => {
    if (!algo.call) {
      reject('disabled');
    }
    const urls = [
      'http://' + algo.host + ':' + algo.port + '/' + algo.path
    ];
    urls.forEach(function (url) {
      request(
        {
          url: url,
          method: 'POST',
          json: true,
          headers: {
            'Content-type': 'application/json',
          },
          body: {'inputText': data},
          timeout: algo.timeout
        },
        (error, res) => {
          requestCallback(error, res, resolve, reject);
        });
    });
  });
}


module.exports.callSemilar = function (text1, text2) {
  const algo = config.algorithms.date_event_extraction;
  return new Promise((resolve, reject) => {
    if (!algo.call) {
      reject('disabled');
    }
    const urls = [
      'http://' + algo.host + ':' + algo.port + '/' + algo.path + "?text1=" + text1 + "&text2=" + text2
    ];
    urls.forEach(function (url) {
      request(
        {
          url: url,
          method: 'GET',
          json: true,
          headers: {
            'Content-type': 'application/json',
          },
          timeout: algo.timeout
        },
        (error, res) => {
          requestCallback(error, res, resolve, reject);
        });
    });
  });
};

function requestCallback(error, res, resolve, reject) {
  if (error) {
    reject(error);
  }
  if (res) {
    resolve(res.body);
  } else {
    reject();
  }
}
