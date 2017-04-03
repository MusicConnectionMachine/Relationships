'use strict';
var exec        = require('child_process').exec;
var clone       = require('clone');
var config      = require('../config');
var fs          = require('fs');
exports.extractRelationships = function(args, res, next) {
  /**
   * Get the relationships from the given set of text array
   * The GetRelationships endpoint returns all the relationships found in the text by running exemplar algorithm on it. The response includes the sentence and the instances which contains detail about each instance of relationship found.
   *
   * inputTextArray String The input text array containing the sentences (optional)
   * inputFilePath String The input filepath consisting of set of sentences (optional)
   * returns List
   **/

  var exMessage = [];
  exMessage['application/json'] = [ {
    "sentence" : "aeiou",
    "instances" : [ {
      "term1" : "aeiou",
      "relation" : "aeiou",
      "term2" : "aeiou"
    } ]
  } ];
  var relations=
    {
      sentence:"",
      instances:[
        {
          term1:"",
          relation:"",
          term2:""
        }
      ]
    };
  var inputFile = args.inputFilePath.value;
  if(!inputFile)
  {
    var arr = args.inputTextArray.value;
    if(!arr)
    {
      inputFile = config.exemplarAlgo.defaultFilePath;
    }
    else {
      inputFile = config.exemplarAlgo.defaultFileSavePath;

      var file = fs.createWriteStream(inputFile);
      file.on('error', function (err) {
        console.log(err);
      });
      arr.forEach(function (v) {
        file.write(v + '\n');
      });
      file.end();
    }
  }

  var command = "java "+config.exemplarAlgo.javaOpt+" -jar "+config.exemplarAlgo.name + " " + inputFile + " " + config.exemplarAlgo.outputFilePath;
  var instancesArr = [];

  exec(command,function (error, stdout, stderr)
  {
    fs.readFile(config.exemplarAlgo.outputFilePath, 'utf8', function(err, contents) {
      var lines = contents.split("\n");
      lines.splice(0,1);
      for(var line in lines) {
        lines[line] = lines[line].replace("\r", "");

        var list = lines[line].split("\t");
        var length = list.length;
        var sentence = list[list.length - 1];
        relations.sentence = sentence;
        instancesArr.push({term1: list[0], term2:list[2], relation:list[1]});
        relations.instances = instancesArr;
        var temp = clone(relations);
        exMessage.push(temp);
        instancesArr = [];
      }
      if (Object.keys(exMessage).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(exMessage));
      } else {
        res.end();
      }
    });
  });
};
