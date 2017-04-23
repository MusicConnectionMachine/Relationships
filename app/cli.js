#!/usr/bin/env node

const config     = require('./cli/config.js');
const db         = require('./dbConnection/');
const wetParser  = require('./fileParser/');
const algorithms = require('./algorithms/');
const web        = require('./webGui');

exports.mainCall = function() {
  db.writeDefaultRelationshipTypesAndDescriptions(config.classificationDescriptions)
    .then(() => {
      return db.getPromisingWebsites();
    }).then(allWebsites => {
      console.log('You can view the status in your browser on HOST_IP:3210');
      web(allWebsites.length);
      // for every blob url in every entity, parse the wet file
      allWebsites.forEach(blobUrl => {
        if (blobUrl) {
          wetParser.parse(blobUrl, 'output')
            .then(websites => {
              websites.map(website => algorithms.call(website.content, website.header))
            }, error => {
              console.error(error);
            });
        }
      });
    })
    .catch(error => {
      console.error(error);
    });
};

exports.mainCall();
