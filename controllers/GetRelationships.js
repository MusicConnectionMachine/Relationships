'use strict';

var url = require('url');

var GetRelationships = require('./GetRelationshipsService');

module.exports.getRelationshipsPOST = function getRelationshipsPOST (req, res, next) {
  GetRelationships.getRelationshipsPOST(req.swagger.params, res, next);
};
