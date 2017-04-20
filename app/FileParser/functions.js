'use strict';
const fs      = require('fs');
const request = require('request');
const path    = require('path');
const zlib    = require('zlib');
const stream  = require('stream');
const es      = require('event-stream');
const config  = require('./config.js');
/**
 * Downloads a file to an output directory from an url.
 * @param url, outputDir
 * @returns {Promise}
 */
function downloadFile(url, outputDir){
  return new Promise((resolve, reject) => {
    let entries = [];
    let name = url.substring(url.lastIndexOf('/') + 1);
    request
      .get(url, {timeout: 2500})
      .on('error', reject)
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
}
/**
 * Downloads a zip file and extract its content to an output directory from an url.
 * @param url , outputDir
 * @returns {Promise}
 */
function downloadAndUnzipFile(url, outputDir){
  return new Promise((resolve, reject) => {
    let entries = [];
    let name = url.substring(url.lastIndexOf('/') + 1);

    request
      .get(url, {timeout: 2500})
      .on('error', reject)
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
}

exports.parseStreamingFileContent = function(filename) {
  return new Promise((resolve, reject) => {
    let lineNr = 0;
    let s = fs.createReadStream(filename)
      .pipe(es.split())
      .pipe(es.mapSync(function (line) {
          // pause the readstream
          s.pause();
          lineNr += 1;
          // process line here and call s.resume() when rdy
          // function below was for logging memory usage
          logMemoryUsage(lineNr);

          // resume the readstream, possibly from a callback
          s.resume();
        })
          .on('error', reject)
          .on('end', function () {
            console.log('Read entire file.');
            resolve();
          })
      );
  });
};
function getFileContent(filename) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filename, 'utf-8', function read(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
/**
 * Downloads and unzips data from an url, the zip should only contain one website.
 * @param url
 * @returns {Promise}
 */
exports.parse = function(url, outputDir) {
  return new Promise((resolve, reject) => {

    downloadAndUnzipFile(url, outputDir)
      .then(function(files) {
        console.log('finishedReading');
        // Read the file for now
        return getFileContent(outputDir + '/' + files[0]);
      }).catch(function(error) {
      console.error('error: ' + error);
      reject(error);
    }).then(function(data) {
      // filter WARC data out
      data = data.split('\n\n')[1];
      // the data should not exceed 20k characters, otherwise our algorithms can't handle them
      let content = data.match(/[\s\S]{1,20000}/g);

      resolve(content);
    }).catch(function(error) {
      console.error('error while downloading', error);
      reject(error);
    });
  });
};

/**
 * For parsing a local wet file with multiple websites in it.
 * @param url
 * @returns {Promise}
 */
exports.parseLocal = function(url,outputDir) {
  return new Promise((resolve, reject) => {
    getFileContent(url)
      .then(function(data) {
        // filter WARC data out
        data = data.split('\n\n\n');
        let content = [];
        data.forEach(d => {
          let plainContent = d.split('\n\n')[1];
          if (plainContent) {
            plainContent = plainContent.match(/[\s\S]{1,20000}/g);
            plainContent.forEach((c) => {
              content.push(c);
            });
          }
        });
        resolve(content);
      }).catch(function(error) {
      console.error('error while reading', error);
      reject(error);
    });
  });
};
