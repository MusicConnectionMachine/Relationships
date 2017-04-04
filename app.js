'use strict';

// TODO: Implement CLI stuff here! (maybe)

var dbConnection = require('./app/DBConnection.js');
var utils = require('./app/Utils.js');
var content = utils.getFileContent('output/bach_output.json');
var contentRel = utils.getFileContent('output/relationships.json');

/*content.then(data => {
  dbConnection.writeEvents(JSON.parse(data));
});*/
contentRel.then(data => {
  dbConnection.writeRelationships(JSON.parse(data));
});

var wetFileParser = require('./app/WETParser.js');

var url = 'https://github.com/MusicConnectionMachine/UnstructuredData/files/850757/CC-MAIN-20170219104612-00150-ip-10-171-10-108.ec2.internal_filtered.warc.zip';

// wetFileParser.parse(url);
