// BASE SETUP
// =============================================================================
const express     = require('express');
const app         = express();
const config      = require('./config');
const bodyParser  = require('body-parser');
const exec        = require('child_process').exec;
const fs          = require('fs');

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
  console.log('Coref Working on resolution of the text');
  next();
});
router.route('/')
  .post(function(req, res) {
    let inputText = req.body.inputText;
    if (inputText) {
      inputText = inputText.replace(/[^\x00-\x7F]/g, '');
      let inputFile = config.corefResolution.defaultFileInputPath;
      let fileWrite = fs.createWriteStream(inputFile);
      fileWrite.on('error', function (err) {
        console.log(err);
      });
      fileWrite.write(inputText);
      fileWrite.end();
      let outputFile = config.corefResolution.defaultFileOutputPath;
      let command = 'java '+ config.corefResolution.javaOpt+' '+ config.corefResolution.libPath + ' '+  config.corefResolution.name+ ' ' +inputFile + ' ' + outputFile;
      exec(command, function (error) {
        if(error){
          console.log(error);
        }
        fs.readFile(outputFile, 'utf8', function(err, contents) {
          if(err)
            throw err;
          res.json(contents);
        });
      });
    } else {
      res.json('send data properly');
    }
  });
app.use('/', router);
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server started at ' + host + ' and listening on port ' + port);
