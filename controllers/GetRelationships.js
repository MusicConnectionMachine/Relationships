'use strict';

var GetRelationships = require('./GetRelationshipsService');

module.exports.getRelationshipsPOST = function getRelationshipsPOST (req, res, next) {
  GetRelationships.getRelationshipsPOST(req.swagger.params, res, next);
};
