'use strict';

const fs = require('fs');
const request = require('request');
const path = require('path');
const zlib = require('zlib');

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
    let name = url.substring(url.lastIndexOf('/') + 1);

    request
      .get(url, {timeout: 2500})
      .on('error', function(err) {
        reject(err);
      })
      .on('response', (response) => {
        console.log('Download complete');
        if (!fs.existsSync(outputDir)){
          fs.mkdirSync(outputDir);
        }
        entries.push(name);
        response
          .pipe(zlib.createInflate())
          .pipe(fs.createWriteStream(outputDir + '/' + name))
          .on('finish', function() {
            console.log('Unzip complete');
            resolve(entries);
          });
      });
  });
};

exports.removeArrayElements = function(array, elementsToBeRemoved) {
  elementsToBeRemoved.forEach(element => {
    var i = array.indexOf(element);
    if (i != -1) array.splice(i, 1);
  });
  return array;
};
