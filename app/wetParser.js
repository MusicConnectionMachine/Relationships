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
        // split the different websites
        data = data.split('\n\n\n');

        // filter out warc info, TODO: we may need that data later
        // TODO: use more than one website (still testing)
        let content = [];
        data.forEach(function(entry) {
          content.push(entry.split('\n\n')[1]);
        });

        // TODO: delete this later, just try to prevent timeout
        //content = content.substring(0, 100);
        console.log('Website Count: ' + content.length);

        // TODO: Call Coref and other algorithms
        resolve(content);
      }).catch(function(error) {
        console.error('error while downloading', error);
        reject(error);
      });
  });
};
