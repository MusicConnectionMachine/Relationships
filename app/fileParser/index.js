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

exports.getFileContent = function(filename) {
  return getFileContent(filename);
};

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
      }).then(function(data) {
        let content = [];
        let header = [];
        data.forEach(d => {
          let plainHeader = d.split('\n\n')[0];
          let plainContent = d.split('\n\n')[1];
          if (plainContent) {
            plainContent = plainContent.match(/[\s\S]{1,20000}/g);
            plainContent.forEach((c) => {
              content.push(c);
            });
          }
          if(plainHeader) {
            header.push(plainHeader);
          }
        });
        let result = { 'content' : content, 'header' : header};
        resolve(result);
      }).catch(function(error) {
        console.error(error);
        reject(error);
      });
  });
};

/**
 * For parsing a local wet file with multiple websites in it.
 * @param url
 * @returns {Promise}
 */
exports.parseLocal = function(url) {
  return new Promise((resolve, reject) => {
    getFileContent(url)
      .then(function(data) {
        // filter WARC data out
        data = data.split('\n\n\n');
        let content = [];
        let header = [];
        data.forEach(d => {
          d = d.split('\n\n');
          let plainHeader = d[0];
          let plainContent = d[1];
          if (plainContent) {
            plainContent = plainContent.match(/[\s\S]{1,20000}/g);
            plainContent.forEach((c) => {
              content.push(c);
            });
          }
          if(plainHeader) {
            header.push(plainHeader);
          }
        });
        let result = { 'content' : content, 'header' : header};
        resolve(result);
      }).catch(function(error) {
        console.error('error while reading', error);
        reject(error);
      });
  });
};


/**
 * For parsing a local file with multiple lines to an array with one entry per line.
 * @param file
 * @returns {Promise}
 */
exports.file2Array = function(file) {
  return new Promise((resolve, reject) => {
    getFileContent(file)
      .then(function(data) {
        data = data.trim();
        data = data.split(/\r?\n/);
        resolve(data);
      }).catch(function(error) {
        console.error('error while reading', error);
        reject(error);
      });
  });
};
