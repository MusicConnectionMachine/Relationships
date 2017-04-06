'use strict';

const fs = require('fs');
const request = require('request');
const path = require('path');
const unzip = require('unzip');

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

module.exports.downloadFile = function(url, outputDir){
  return new Promise((resolve, reject) => {
    let entries = [];
    let name = url.substring(url.lastIndexOf('/') + 1);
    request
      .get(url, {timeout: 2500})
      .on('error', function(err) {
        reject(err);
      })
      .on('response', function(response) {
        console.log('Download: ' + response.headers['content-type']);
        console.log(name);
        entries.push(name);
      })
      .pipe(fs.createWriteStream(outputDir + '/' + name))
      .on('finish', () => {
        console.log('Finished reading: ' + name);
        resolve(entries);
      });
  });
};


module.exports.downloadAndUnzipFile = function(url, outputDir){
  return new Promise((resolve, reject) => {
    let entries = [];
    request
      .get(url, {timeout: 2500})
      .on('error', function(err) {
        reject(err);
      })
      .on('response', function(response) {
        if (response.headers['content-type'] !== 'application/x-zip-compressed') {
          reject();
          return;
        }
        console.log('Download: ' + response.headers['content-type']);
      })
      .pipe(unzip.Parse())
      .on('entry', function (entry) {
        console.log('Download complete, unzip complete.')
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
