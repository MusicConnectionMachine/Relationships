'use strict';

var fs = require('fs');
var request = require('request');
var unzip = require('unzip');

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
  var entries = [];

  return new Promise((resolve, reject) => {
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
