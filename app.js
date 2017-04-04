'use strict';

// TODO: Implement CLI stuff here! (maybe)

const utils = require('./app/utils.js');
const dbConnection = require('./app/dbConnection.js');

// test writing event data in DB
let content = utils.getFileContent('output/bachOutput.json');
content.then(data => {
  dbConnection.writeEvents(JSON.parse(data));
});

// test writing relationship data in DB
let contentRel = utils.getFileContent('output/relationships.json');
contentRel.then(data => {
  dbConnection.writeRelationships(JSON.parse(data));
});

// test getting and parsing a wet file from the url
let url = 'https://github.com/MusicConnectionMachine/UnstructuredData/files/850757/CC-MAIN-20170219104612-00150-ip-10-171-10-108.ec2.internal_filtered.warc.zip';
wetFileParser.parse(url);
