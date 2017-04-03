'use strict';

var fs = require('fs');
var path = require('path');

module.exports.getFileContentLocal = function(filename) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, filename), 'utf-8', function read(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports.getFileContentHTTP = function(link) {
  return new Promise(function (resolve, reject) {
    // TODO: Read file from blob storage
  });
};
