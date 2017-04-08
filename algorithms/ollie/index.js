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
  console.log('Ollie Working on finding the Relationships');
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
      let inputFile = config.ollieAlgo.defaultFileInputPath;
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
      let command = 'java ' + config.ollieAlgo.javaOpt + ' -jar ' + config.ollieAlgo.name + ' ' + inputFile;
      let instancesArr = [];
      exec(command, function (error, stdout) {
        let lines = stdout.toString().replace(/([.?!])\s*(?=[A-Z])/g, '\n').split('\n');
        for (let line in lines) {
          lines[line] = lines[line].replace('\r', '');
          if (lines[line].charAt(0) == '' || lines[line].charAt(0) == ' ')
            continue;
          if (lines[line].charAt(0) != '0') {
            if (line == 0) { relations.sentence = lines[line]; }
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
            list[1] = list[1].replace('(', '');
            list[1] = list[1].replace(')', '');
            re = /\s*;\s*/;
            let terms = list[1].split(re);
            if (quali && terms[0] && terms[1] && terms[2] && wordcount(terms[1]) < config.ollieAlgo.LimitRelationWordCount)
              instancesArr.push({quality: quali, term1: terms[0], term2: terms[2], relation: terms[1]});
          }
        }
        res.json(exMessage);
      });
    }
    else {
      res.json('send data properly');
    }
  });
app.use('/ollie', router);
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server started at ' + host + ' and listening on port ' + port);
