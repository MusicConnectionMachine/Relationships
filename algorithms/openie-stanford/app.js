// BASE SETUP
// =============================================================================
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config.json');
const relationships = require('./relationship.js');

// configure body parser
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb'}));

const port = process.env.PORT || config.port; // set our port

// ROUTES FOR OUR API
// =============================================================================
const router = express.Router();
// middleware to use for all requests
router.use(function (req, res, next) {
  // do logging
  console.log('Working on finding the relationships');
  next();
});
router.route('/getRelationships')
  .post(function (req, res) {
    if (req.body) {
      const inputText = req.body.inputText;
      if (inputText) {
        relationships.call(inputText, function (data) {
          console.log(data);
          res.json(data);
        });
      } else {
        console.log('error: problem with input text!');
      }
    } else {
      res.json('error: what\'s up with the body?');
    }
  });

app.use('/openie_stanford', router);
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server started and listening on port ' + port);

