'use strict';
const exec        = require('child_process').exec;
const fs          = require('fs');
const config      = require('../config');
exports.corefResolution = function(args, res) {
  let inputText = args.inputText.value;
  let inputFile = config.corefResolution.defaultFileInputPath;
  let fileWrite = fs.createWriteStream(inputFile);
  fileWrite.on('error', function (err) {
    console.log(err);
  });
  fileWrite.write(inputText);
  fileWrite.end();
  let outputFile = config.corefResolution.defaultFileOutputPath;
  let command = "java "+ config.corefResolution.javaOpt+" "+ config.corefResolution.libPathwin + " "+  config.corefResolution.name+ " " +inputFile + " " + outputFile;

  exec(command, function (error) {
    if(error){
      console.log(error);
    }
    fs.readFile(outputFile, 'utf8', function(err, contents) {
      if(err)
        throw err;
      res.end(contents);
    });
  });
};
