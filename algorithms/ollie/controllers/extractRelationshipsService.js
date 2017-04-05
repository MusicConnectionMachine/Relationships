'use strict';
let exec        = require('child_process').exec;
let clone       = require('clone');
let config      = require('../config');
let fs          = require('fs');
let Tokenizer   = require('sentence-tokenizer');
let tokenizer   = new Tokenizer('Chuck');
let natural = require('natural');
let wordcount = require('wordcount');
natural.PorterStemmer.attach();
exports.extractRelationships = function(args, res) {
  /**
   * Get the relationships from the given set of text array
   * The extractRelationships endpoint returns all the relationships found in the text by running ollie algorithm on it. The response includes the sentence and the instances which contains detail about each instance of relationship found.
   *
   * inputTextArray String The input text array containing the sentences (optional)
   * inputFilePath String The input filepath consisting of set of sentences (optional)
   * returns List
   **/
  let exMessage = [];
  let relations=
    {
      sentence:"",
      instances:[
        {
          quality:"",
          term1:"",
          term2:"",
          relation:""
        }
      ]
    };
  let inputText = args.inputText.value;

  console.log(inputText);
  let inputFile = config.ollieAlgo.defaultFileInputPath;
  let outputFile = config.ollieAlgo.defaultFileOutputPath;
  let fileWrite = fs.createWriteStream(inputFile);

  fileWrite.on('error', function (err)
  {
    console.log(err);
  });
  fileWrite.write(inputText);
  fileWrite.end();


  fileWrite = fs.createWriteStream(outputFile);
  fs.readFile(inputFile, 'utf8', function (err, contents) {
    tokenizer.setEntry(contents);
    let allSentences = tokenizer.getSentences();
    for (let sentence in allSentences) {
      fileWrite.write(allSentences[sentence] + '\n');
    }
    fileWrite.end();
  });
  let command = "java " + config.ollieAlgo.javaOpt + " -jar " + config.ollieAlgo.name + " " + outputFile;
  let instancesArr = [];
  exec(command, function (error, stdout) {
    let lines = stdout.toString().replace(/([.?!])\s*(?=[A-Z])/g, "\n").split("\n");
    for (let line in lines) {
      lines[line] = lines[line].replace("\r", "");
      if (lines[line].charAt(0) == '' || lines[line].charAt(0) == ' ')
        continue;
      if (lines[line].charAt(0) != '0') {
        if (line == 0) {
          relations.sentence = lines[line];
        }
        else {
          if (instancesArr.length > 0) {
            relations.instances = instancesArr;
            let temp = clone(relations);
            exMessage.push(temp);
            relations.sentence = lines[line];
            instancesArr = [];
          }
          else {
            relations.sentence = lines[line];
            instancesArr = [];
          }
        }
      }
      else {
        let re = /\s*:\s*/;
        let list = lines[line].split(re);
        let quali = list[0];
        list[1] = list[1].replace("(", "");
        list[1] = list[1].replace(")", "");
        re = /\s*;\s*/;
        let terms = list[1].split(re);
        if (quali && terms[0] && terms[1] && terms[2] && wordcount(terms[1]) < 3)
          instancesArr.push({quality: quali, term1: terms[0], term2: terms[2], relation: terms[1]});
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
