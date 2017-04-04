'use strict';

var utils = require('./Utils.js');

var outputDir = 'output';
exports.parse = function(url) {
  // TODO: add file location to the volume from anshul
  utils.downloadAndUnzipFile(url, outputDir)
    .then(function(files) {
      console.log('finishedReading');
      // Just read the first file for now, TODO: read all files in the zip
      utils.getFileContent(outputDir + '/' + files[0])
        .catch(function (error) {
          console.error(error);
          console.log('error: reading file: ' + files[0]);
          return;
        }).then(function (data) {
          // split the different websites
          data = data.split("\n\n\n");

          // filter out warc info, TODO: we may need that data later
          // TODO: use more than one website (still testing)
          var content = [];
          data.forEach(function(entry) {
            content.push(entry.split("\n\n")[1]);
          });

          // TODO: delete this later, just try to prevent timeout
          //content = content.substring(0, 100);
          console.log('Website Count: ' + content.length);

          // TODO: Call Coref and other algorithms
          return content;
        });
    })
    .catch( e => console.error('error while downloading', e));
};


