// BASE SETUP
// =============================================================================
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require('./config.json');
var relationships = require('./relationship.js');
const relationshipsController = require('./relationship.controller');

// configure body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || config.port; // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();
// middleware to use for all requests
router.use(function (req, res, next) {
  // do logging
  console.log('Working on finding the relationships');
  next();
});
router.route('/getRelationships')
  .post(function (req, res) {
    if (req.body) {
      var inputText = req.body.text;
      if (inputText) {
        relationships.call(inputText, function (data) {
          res.json(data);
        });
      } else {
        console.log('error: problem with input text!');
      }
    } else {
      res.json('error: what\'s up with the body?');
    }
  })
  .get(function (req, res) {
    relationships.call("Mozart lives in salzburg.", function (data) {
      res.json(data);
    });
  });

app.use('/openie_stanford', router);
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server started and listening on port ' + port);

