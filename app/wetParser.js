'use strict';

const utils = require('./utils.js');
const outputDir = 'output';

exports.parse = function(url) {
  return new Promise((resolve, reject) => {
    // TODO: add file location to the volume from anshul
    utils.downloadAndUnzipFile(url, outputDir)
      .then(function(files) {
        console.log('finishedReading');
        // Just read the first file for now, TODO: read all files in the zip
        return utils.getFileContent(outputDir + '/' + files[0]);
      }).catch(function(error) {
        console.error('error: ' + error);
        reject(error);
      }).then(function(data) {
        // filter WARC data out
        data = data.split('\n\n')[1];
        resolve(data);
      }).catch(function(error) {
        console.error('error while downloading', error);
        reject(error);
      });
  });
};

exports.parseLocal = function(url) {
  return new Promise((resolve, reject) => {
    utils.getFileContent(url)
      .then(function(data) {
        // filter WARC data out
        data = data.split('\n\n\n');
        let content = [];
        data.forEach(d => {
          content.push(d.split('\n\n')[1])
        });
        resolve(content);
      }).catch(function(error) {
        console.error('error while downloading', error);
        reject(error);
      });
  });
};
