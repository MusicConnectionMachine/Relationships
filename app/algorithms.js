const promiseQueue = require('promise-queue');
const maxConcurrent = 1;
const maxQueue = Infinity;
const corefQueue = new promiseQueue(maxConcurrent, maxQueue);
const dateQueue = new promiseQueue(maxConcurrent, maxQueue);
const ollieQueue = new promiseQueue(maxConcurrent, maxQueue);
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
module.exports.call = function(websites) {
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
    corefQueue.add(() => callCoReferenceResolution(website))
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
        console.log('Call DateEventExcraction');
        dateQueue.add(() => callDateEventExtraction(replacedCorefs))
          .then(result => {
            if (result) {
              if (typeof(result) === 'string') {
                console.log('DateEventExcraction: Result is a String: ' + result);
              } else {
                // write to db
                console.log('DateEventExcraction: Write JSON to DB');
                dbConnection.writeEvents(result);
              }
            } else {
              console.log('DateEventExtraction: Finished, but result was ' + result);
            }
          }, error => {
            console.error('DateEventExcraction: ' + error);
          });
        console.log('Call Ollie');
        ollieQueue.add(() => callOllie(replacedCorefs))
          .then(result => {
            if (result) {
              if (typeof(result) === 'string') {
                console.log('Ollie: Result is a String: ' + result);
              } else {
                // write to db
                console.log('Ollie: Write JSON to DB');
                dbConnection.writeRelationships(result);
              }
            } else {
              console.log('Ollie: Finished, but result was ' + result);
            }
          }, error => {
            console.error('Ollie: ' + error);
          });
        resolve();
      });
  });
}


function callCoReferenceResolution(data) {
  return new Promise((resolve, reject) => {
    const urls = [
      'http://' + config.algorithms.coreference_resolution.host + ':' + config.algorithms.coreference_resolution.port + '/' + config.algorithms.coreference_resolution.path
    ];
    urls.forEach((url) => {
      request(
        {
          url: url,
          method: 'POST',
          json: true,
          headers: {
            'Content-type': 'application/json',
          },
          body: data
        },
        function callback(error, res) {
          requestCallback(error, res, resolve, reject);
        });
    });
  });
}

function callOllie(data) {
  return new Promise((resolve, reject) => {
    const urls = [
      'http://' + config.algorithms.ollie.host + ':' + config.algorithms.ollie.port + '/' + config.algorithms.ollie.path
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
          body: data
        },
        function callback(error, res) {
          requestCallback(error, res, resolve, reject);
        });
    });
  });
}

function callDateEventExtraction(data) {
  return new Promise((resolve, reject) => {
    const urls = [
      'http://' + config.algorithms.date_event_extraction.host + ':' + config.algorithms.date_event_extraction.port + '/' + config.algorithms.date_event_extraction.path
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
          body: {'inputText': data}
        },
        function callback(error, res) {
          requestCallback(error, res, resolve, reject);
        });
    });
  });
}

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
