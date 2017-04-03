// BASE SETUP
// =============================================================================
var socketNER   = require("./SocketNER.js");
var NER         = socketNER(1234, null , "./StanfordNER/");
var express     = require('express');
var app         = express();
var fs          = require('fs');
var clone       = require('clone');
var exec        = require('child_process').exec;
var morgan      = require('morgan');
var request     = require('request');
var config      = require("./config");
var bodyParser  = require('body-parser');
var Tokenizer   = require('sentence-tokenizer');
var tokenizer   = new Tokenizer('Chuck');

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port     = process.env.PORT || config.server.port; // set our port

//starting the NLP server for extracting the entities, it will always be started to serve fast
NER.init();
// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();
// middleware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('Working on finding the dates and events');
  next();
});
router.route('/getDateEvents')
  .post(function(req, res)
  {
    var exMessage = [];

    var events=
      {
        start: "",
        end: "",
        event:""
      };

    if(req.body) {
      var inputFile = req.body.inputFilePath;
      if (!inputFile) {
        var arr = req.body.inputTextArray;
        if (!arr) {
          inputFile = config.dateEventExtraction.defaultFilePath;
        }
        else {
          inputFile = config.dateEventExtraction.defaultFileSavePath;

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
    }
    else
    {
      inputFile = config.dateEventExtraction.defaultFilePath;
    }
    var lines = [];
    var instancesArr = [];
    fs.readFile(inputFile, 'utf8', function(err, contents)
    {
      tokenizer.setEntry(contents);
      var allSentences= tokenizer.getSentences();
      for(var sentence in allSentences)
      {
        var en= NER.getEntities(allSentences[sentence], "");
        if(en.DATE)
        {

          events.start= en.DATE[0];
          events.end= en.DATE[1];
          events.event=allSentences[sentence];
          var temp = clone(events);
          exMessage.push(temp);
        }
      }
      res.json(exMessage);
    });
  });
router.get('/close',function(req,res)
{
  NER.close();
  res.json({ message: 'closed the NLP server' });
});
app.use('/date_event_extraction', router);
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server started and listening on port ' + port);
