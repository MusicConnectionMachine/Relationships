'use strict';
var exec        = require('child_process').exec;
var clone       = require('clone');
var config      = require('../config');
var fs          = require('fs');
exports.extractRelationships = function(args, res, next) {
  /**
   * Get the relationships from the given set of text array
   * The extractRelationships endpoint returns all the relationships found in the text by running ollie algorithm on it. The response includes the sentence and the instances which contains detail about each instance of relationship found.
   *
   * inputTextArray String The input text array containing the sentences (optional)
   * inputFilePath String The input filepath consisting of set of sentences (optional)
   * returns List
   **/

  var exMessage = [];
  exMessage['application/json'] = [ {
    "sentence" : "aeiou",
    "instances" : [ {
      "term2" : "aeiou",
      "term3" : "aeiou",
      "term1" : "aeiou",
      "quality" : 1.3579000000000001069366817318950779736042022705078125
    } ]
  } ];
  var relations=
    {
      sentence:"",
      instances:[
        {
          quality:"",
          term1:"",
          term2:"",
          term3:""
        }
      ]
    };
  var inputFile = args.inputFilePath.value;
  if(!inputFile)
  {
    var arr = args.inputTextArray.value;
    if(!arr)
    {
      inputFile = config.ollieAlgo.defaultFilePath;
    }
    else {
      inputFile = config.ollieAlgo.defaultFileSavePath;
      var file = fs.createWriteStream(inputFile);
      file.on('error', function (err)
      {
        console.log(err);
      });
      arr.forEach(function (v)
      {
        file.write(v + '\n');
      });
      file.end();
    }
  }
  var lines = [];
  var command = "java "+ config.ollieAlgo.javaOpt+" -jar "+ config.ollieAlgo.name+ " " + inputFile  ;
  var instancesArr = [];
  exec(command,function (error, stdout, stderr)
  {
    var lines = stdout.toString().replace(/([.?!])\s*(?=[A-Z])/g, "\n").split("\n");
    for(var line in lines)
    {
      lines[line] = lines[line].replace("\r", "");
      if(lines[line].charAt(0)== '' || lines[line].charAt(0)== ' ')
        continue;
      if(lines[line].charAt(0) != '0')
      {
        if(line == 0)
        {
          relations.sentence = lines[line];
        }
        else
        {
          relations.instances = instancesArr;
          var temp = clone(relations);
          exMessage.push(temp);
          relations.sentence = lines[line];
          instancesArr =[];
        }
      }
      else
      {
        var re = /\s*:\s*/;
        var list = lines[line].split(re);
        var quali =list[0];
        list[1] = list[1].replace("(", "");
        list[1] = list[1].replace(")", "");
        re = /\s*;\s*/;
        var terms = list[1].split(re);
        instancesArr.push({quality:quali, term1:terms[0], term2:terms[1],term3:terms[2]});
      }
    }
  if (Object.keys(exMessage).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(exMessage));
  } else {
    res.end();
  }
  });
};
