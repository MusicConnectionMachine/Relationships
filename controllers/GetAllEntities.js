'use strict';

var GetAllEntities = require('./GetAllEntitiesService');

module.exports.getAllEntitiesPOST = function getAllEntitiesGET (req, res, next) {
  GetAllEntities.getAllEntitiesPOST(req.swagger.params, res, next);
};
