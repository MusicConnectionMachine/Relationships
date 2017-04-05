'use strict';

let getRelationships = require('./extractRelationshipsService');

module.exports.extractRelationships = function extractRelationships (req, res, next) {
  getRelationships.extractRelationships(req.swagger.params, res, next);
};
