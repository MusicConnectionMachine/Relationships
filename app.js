'use strict';

// TODO: Implement CLI stuff here! (maybe)

const utils = require('./app/utils.js');
const wetFileParser = require('./app/wetParser.js');
const dbConnection = require('./app/dbConnection.js');

// test writing event data in DB
utils.getFileContent('output/bachOutput.json').then(data => {
  dbConnection.writeEvents(JSON.parse(data));
});

// test writing relationship data in DB
utils.getFileContent('output/relationships.json').then(data => {
  dbConnection.writeRelationships(JSON.parse(data));
});

// test getting and parsing a wet file from the url
wetFileParser.parse('https://github.com/MusicConnectionMachine/UnstructuredData/files/850757/CC-MAIN-20170219104612-00150-ip-10-171-10-108.ec2.internal_filtered.warc.zip');
