'use strict';

var url = require('url');
var getRelationships = require('./extractRealtionshipsService');

module.exports.extractRealtionships = function extractRealtionships (req, res, next) {
  getRelationships.extractRealtionships(req.swagger.params, res, next);
};
