'use strict';
var exec        = require('child_process').exec;
var config      = require('../config');
exports.corefResolution = function(args, res, next) {
  var inputFile = args.inputFilePath.value;
  if(!inputFile) {
    inputFile = config.corefResolution.defaultFileInputPath;
  }
  var command = "java "+ config.corefResolution.javaOpt+" "+ config.corefResolution.libPath + " "+  config.corefResolution.name+ " " +inputFile + " " + config.corefResolution.defaultFileOutputPath;

  exec(command, function (error, stdout, stderr) {
    if(error){
      console.log(error);
    } else {
      console.log(stderr);
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify("completed"));
  });
};
