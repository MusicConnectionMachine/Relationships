'use strict';
var exec        = require('child_process').exec;
var clone       = require('clone');
var config      = require('../config');
var fs          = require('fs');
exports.extractRelationships = function(args, res, next) {
  /**
   * Get the relationships from the given set of text array
   * The GetRelationships endpoint returns all the relationships found in the text by running openIE algorithm on it. The response includes the sentence and the instances which contains detail about each instance of relationship found.
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
      "term2" : "aeiou",
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
      inputFile = config.openieAlgo.defaultFilePath;
    }
    else {
      inputFile = config.openieAlgo.defaultFileSavePath;

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

  var lines = [];
  var command = "java "+config.openieAlgo.javaOpt+" -jar "+config.openieAlgo.name + " " + inputFile + " " + config.openieAlgo.format;
  var instancesArr = [];

  exec(command,function (error, stdout, stderr)
  {
    var lines = stdout.toString().replace(/([.?!])\s*(?=[A-Z])/g, "\n").split("\n");
    lines.splice(0,20);
    for(var line in lines)
    {
      lines[line] = lines[line].replace("\r", "");

      var list = lines[line].split("\t");
      var length = list.length;
      var sentence = list[list.length - 1];

      if(relations.sentence != sentence)
      {
        if(line == 0)
        {
          relations.sentence = sentence;
        }
        else {
          relations.instances = instancesArr;
          var temp = clone(relations);
          exMessage.push(temp);
          relations.sentence = sentence;
          instancesArr = [];
        }
      }
      var quali =list[0];
      var term1= "",term2="",relation="";
      for(var i=1;i<length-1;i++)
      {
        var re = /\s*;\s*/;
        var subterms = list[i].split(re);
        for(var sub in subterms)
        {
          if(subterms[sub].includes("SimpleArgument"))
          {
            var testTerm = subterms[sub].match("SimpleArgument(.*),L");
            testTerm[1] = testTerm[1].replace("(", "");
            if(term1 == "")
              term1=testTerm[1];
            else
              term2= testTerm[1];
          }
          else if(subterms[sub].includes("Relation"))
          {
            var testRe = subterms[sub].match("Relation(.*),L");
            testRe[1] = testRe[1].replace("(", "");
            relation=testRe[1];
          }
        }
      }
      instancesArr.push({quality:quali, term1: term1, term2:term2, relation:relation});
    }
  if (Object.keys(exMessage).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(exMessage));
  } else {
    res.end();
  }
  });
};
