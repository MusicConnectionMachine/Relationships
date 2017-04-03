'use strict';

var url = require('url');

var GetAllEntities = require('./GetAllEntitiesService');

module.exports.getAllEntitiesPOST = function getAllEntitiesGET (req, res, next) {
  GetAllEntities.getAllEntitiesPOST(req.swagger.params, res, next);
};
