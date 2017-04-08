// BASE SETUP
// =============================================================================
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config.json');
const relationships = require('./relationship.js');

// configure body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

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
  .get(function (req, res) {
    if (req.body) {
      const inputText = req.body;
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
  });

app.use('/openie_stanford', router);
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server started and listening on port ' + port);

