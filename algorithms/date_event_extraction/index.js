// BASE SETUP
// =============================================================================
let socketNER   = require('./SocketNER.js');
let NER         = socketNER(1234, null , './StanfordNER/');
let express     = require('express');
let app         = express();
let fs          = require('fs');
let clone       = require('clone');
let config      = require('./config');
let bodyParser  = require('body-parser');
let Tokenizer   = require('sentence-tokenizer');
let tokenizer   = new Tokenizer('Chuck');

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let port     = process.env.PORT || config.server.port; // set our port

//starting the NLP server for extracting the entities, it will always be started to serve fast
NER.init();
// ROUTES FOR OUR API
// =============================================================================
let router = express.Router();
// middleware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('Working on finding the dates and events');
  next();
});
router.route('/getDateEvents')
  .post(function(req, res) {
    let exMessage = [];
    let events=
      {
        start: '',
        end: '',
        event:''
      };
    let inputText = req.body.inputText;
    let inputFile = config.dateEventExtraction.defaultFileInputPath;

    if(inputText) {
      let fileWrite = fs.createWriteStream(inputFile);
      fileWrite.on('error', function (err) {
        console.log(err);
      });
      fileWrite.write(inputText);
      fileWrite.end();
      fs.readFile(inputFile, 'utf8', function(err, contents) {
        tokenizer.setEntry(contents);
        let allSentences= tokenizer.getSentences();
        for(let sentence in allSentences) {
          let en= NER.getEntities(allSentences[sentence], '');
          if(en.DATE) {
            events.start= en.DATE[0];
            events.end= en.DATE[1];
            events.event=allSentences[sentence];
            let temp = clone(events);
            exMessage.push(temp);
          }
        }
        res.json(exMessage);
      });
    }
    else {
      res.json('send data properly');
    }
  });
router.get('/close',function(req,res) {
  NER.close();
  res.json({ message: 'closed the NLP server' });
});
app.use('/date_event_extraction', router);
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server started and listening on port ' + port);
