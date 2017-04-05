'use strict';

const fs = require('fs');
const request = require('request');
const path = require('path');
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

module.exports.getTestFileContent = function(filename) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, '../example') + '/' + filename, 'utf-8', function read(err, data) {
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

module.exports.callCoReferenceResolution = function (data) {
  return new Promise((resolve, reject) => {
    const urls = [
      'http://' + config.algorithms.coreference_resolution.host + ':' + config.algorithms.coreference_resolution.port + '/' + config.algorithms.coreference_resolution.path
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
};

module.exports.callOllie = function (data) {
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
};

module.exports.callDateEventExtraction = function (data) {
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
