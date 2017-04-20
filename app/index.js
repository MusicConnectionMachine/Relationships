'use strict';
const express       = require('express');
const bodyParser    = require('body-parser');
const app           = express();
const fs            = require('fs');
const path          = require('path');
const wetFileParser = require('./FileParser/functions.js');
const dbConnection  = require('./DbConnection/functions.js');
const algorithms    = require('./Algorithms/functions.js');
const web           = require('./WebGui/functions');
//===============EXPRESS=================

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//===============ROUTES=================
//work based upon our homepage
app.get('/', function(req, res){
// Call chain
  res.json("Welcome to Relationships");
});
app.get('/storeRelationships', function(req, res){
// Call chain
// get all websites for all entities from the DB
  dbConnection.getWebsitesToEntities()
    .then(blobPerEntity => {
      Object.keys(blobPerEntity).forEach(entityId => {
        // for every entity
        blobPerEntity[entityId].forEach(blobUrl => {
          // for every blob url in every entity, parse the wet file
          wetFileParser.parse(blobUrl)
            .then(allWebsites => {
              algorithms.call(allWebsites);
            }, error => {
              console.error(error);
            });
        });
      });
    });

});
app.get('/test', function(req,res){
  // test writing event data in DB
  /*utils.getFileContent('output/bachOutput.json').then(data => {
   dbConnection.writeEvents(JSON.parse(data));
   });*/

  /*const generatePromises = function* (blobPerEntity) {
   let keys = Object.keys(blobPerEntity);
   for (let i = 0; i < keys.length; i++) {
   for (let j = 0; j < blobPerEntity[keys[i]].length; j++) {
   console.log(blobPerEntity[keys[i]][j]);
   yield wetFileParser.parse(blobPerEntity[keys[i]][j]);
   }
   }
   };
   */

  /*dbConnection.getWebsitesToEntities()
   .then(blobPerEntity => {
   let keys = Object.keys(blobPerEntity);
   for (let i = 0; i < keys.length; i++) {
   for (let j = 0; j < blobPerEntity[keys[i]].length; j++) {
   wetFileParser.parse(blobPerEntity[keys[i]][j])
   .then(allWebsites => {
   algorithms.call(allWebsites);
   }, error => {
   console.error(error);
   });
   }
   }
   });*/

  /*
   // test writing relationship data in DB
   utils.getFileContent('output/relationships.json').then(data => {
   dbConnection.writeRelationships(JSON.parse(data));
   });
   */

// test getting and parsing a wet file from the url
//wetFileParser.parse('https://github.com/MusicConnectionMachine/UnstructuredData/files/872381/combined-wiki-data-from-153-WETs.zip')

  wetFileParser.parseLocal('./output/combined-wiki-data-from-153-WETs.wet')
    .then(allWebsites => {
      web(allWebsites.length);
      algorithms.call(allWebsites);
    }, error => {
      console.error(error);
    });
});
module.exports = app;


