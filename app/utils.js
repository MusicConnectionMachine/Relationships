'use strict';

const fs = require('fs');
const request = require('request');
const unzip = require('unzip');
const config = require('../config');

module.exports.getFileContent = function(filename) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filename, 'utf-8', function read(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports.downloadAndUnzipFile = function(url, outputDir){
  return new Promise((resolve, reject) => {
    let entries = [];
    request
      .get(url, {timeout: 1500})
      .on('error', function(err) {
        console.error(err);
        reject(err);
      })
      .on('response', function(response) {
        console.log(response.headers['content-type']);
      })
      .pipe(unzip.Parse())
      .on('entry', function (entry) {
        if (!fs.existsSync(outputDir)){
          fs.mkdirSync(outputDir);
        }
        entries.push(entry.path);
        entry.pipe(fs.createWriteStream(outputDir + '/' + entry.path));
      })
      .on('finish', function() {
        resolve(entries);
      });
  });
};
module.exports.callCoReferenceResolution = function (data, done) {
  let URL ='http://' + config.algorithms[5].coreference_resolution.host + ':' + config.algorithms[5].coreference_resolution.port + '/' + config.algorithms[5].coreference_resolution.path;
  let corefURL = [URL];
  corefURL.forEach(function (urld) {
    request(
      {
        url: urld,
        method: 'POST',
        json: true,
        headers: {
          'Content-type': 'application/json',
        },
        body: data
      },
      function callback(error, res) {
        if (error) {
          console.error(error);
        }
        done(res.body);
      });
  });
};
module.exports.callOllie = function (data, done) {
  let URL ='http://' + config.algorithms[0].ollie.host + ':' + config.algorithms[0].ollie.port + '/' + config.algorithms[0].ollie.path;
  let corefURL = [URL];
  corefURL.forEach(function (urld) {
    request(
      {
        url: urld,
        method: 'POST',
        json: true,
        headers: {
          'Content-type': 'application/json',
        },
        body: data
      },
      function callback(error, res) {
        if (error) {
          console.error(error);
        }
        done(res.body);
      });
  });
};
module.exports.callDateEventExtraction = function (data, done) {
  let URL ='http://' + config.algorithms[3].date_event_extraction.host + ':' + config.algorithms[3].date_event_extraction.port + '/' + config.algorithms[3].date_event_extraction.path;
  let corefURL = [URL];
  corefURL.forEach(function (urld) {
    request(
      {
        url: urld,
        method: 'POST',
        json: true,
        headers: {
          'Content-type': 'application/json',
        },
        body: {'inputText':data}
      },
      function callback(error, res) {
        if (error) {
          console.error(error);
        }
        done(res.body);
      });
  });
};
