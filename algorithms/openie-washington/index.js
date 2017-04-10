// BASE SETUP
// =============================================================================
const express     = require('express');
const app         = express();
const clone       = require('clone');
const config      = require('./config');
const bodyParser  = require('body-parser');
const Tokenizer   = require('sentence-tokenizer');
const tokenizer   = new Tokenizer('Chuck');
const exec        = require('child_process').exec;
const fs          = require('fs');
const wordcount = require('wordcount');


// configure body parser
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb'}));

const port     = config.server.port;
const host     = config.server.host;

// ROUTES FOR OUR API
// =============================================================================
const router = express.Router();
// middleware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('OpenIE-Washington Working on finding the Relationships');
  next();
});
router.route('/extractRelationships')
  .post(function(req, res) {
    let exMessage = [];
    let relations =
      {
        sentence: '',
        instances: [
          {
            quality: '',
            term1: '',
            term2: '',
            relation: ''
          }
        ]
      };
    let inputText = req.body.inputText;
    if (inputText) {
      inputText = inputText.replace(/[^\x00-\x7F]/g, '');
      let inputFile = config.openieAlgo.defaultInputFilePath;
      let fileWrite = fs.createWriteStream(inputFile);
      fileWrite.on('error', function (err) {
        console.log(err);
      });
      tokenizer.setEntry(inputText);
      let allSentences = tokenizer.getSentences();
      for (let sentence in allSentences) {
        fileWrite.write(allSentences[sentence] + '\n');
      }
      fileWrite.end();
      let command = 'java '+config.openieAlgo.javaOpt+' -jar '+config.openieAlgo.name + ' ' + inputFile + ' ' + config.openieAlgo.format;
      let instancesArr = [];
      exec(command, function (error, stdout) {
        let lines = stdout.toString().replace(/([.?!])\s*(?=[A-Z])/g, '\n').split('\n');
        lines.splice(0,20);
        for(let line in lines) {
          lines[line] = lines[line].replace('\r', '');
          if (lines[line].charAt(0) == '' || lines[line].charAt(0) == ' ')
            continue;
          let list = lines[line].split("\t");
          let length = list.length;
          let sentence = list[list.length - 1];
          if(relations.sentence != sentence) {
            if(line == 0) {
              relations.sentence = sentence;
            }
            else {
              if (instancesArr.length > 0) {
                relations.instances = instancesArr;
                let temp = clone(relations);
                exMessage.push(temp);
                relations.sentence = sentence;
                instancesArr = [];
              }
              else {
                relations.sentence = sentence;
                instancesArr = [];
              }
            }
          }
          let quali =list[0];
          let term1= '',term2='',relation='';
          for(let i=1;i<length-1;i++) {
            let re = /\s*;\s*/;
            let subterms = list[i].split(re);
            for(let sub in subterms) {
              if(subterms[sub].includes('SimpleArgument')) {
                let testTerm = subterms[sub].match('SimpleArgument(.*),L');
                testTerm[1] = testTerm[1].replace('(', '');
                if(term1 == '')
                  term1=testTerm[1];
                else
                  term2= testTerm[1];
              }
              else if(subterms[sub].includes('Relation')) {
                let testRe = subterms[sub].match('Relation(.*),L');
                testRe[1] = testRe[1].replace('(', '');
                relation=testRe[1];
              }
            }
          }
          if (quali && term1 && term2 && relation && wordcount(relation) < config.openieAlgo.LimitRelationWordCount)
            instancesArr.push({quality:quali, term1: term1, term2:term2, relation:relation});
        }
        res.json(exMessage);
      });
    }
    else {
      res.json('send data properly');
    }
  });
app.use('/openie_washington', router);
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server started at ' + host + ' and listening on port ' + port);
