'use strict';

// FIXME: Delete that later, this is just my personal playground for testing.
// FIXME: Only committed it, because some others might use it for testing their s

const utils = require('./../app/utils.js');
const wetFileParser = require('./../app/wetParser.js');
const dbConnection = require('./../app/dbConnection.js');
const algorithms = require('./../app/algorithms.js');

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

dbConnection.getWebsitesToEntities()
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
  });

/*
// test writing relationship data in DB
utils.getFileContent('output/relationships.json').then(data => {
  dbConnection.writeRelationships(JSON.parse(data));
});
*/

// test getting and parsing a wet file from the url
/*wetFileParser.parse('https://github.com/MusicConnectionMachine/UnstructuredData/files/872381/combined-wiki-data-from-153-WETs.zip')
wetFileParser.parseLocal('./output/combined-wiki-data-from-153-WETs.wet')
  .then(allWebsites => {
    algorithms.call(allWebsites);
  }, error => {
    console.error(error);
  });
*/
