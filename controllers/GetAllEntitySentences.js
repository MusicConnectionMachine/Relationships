'use strict';

var GetAllEntitySentences = require('./GetAllEntitySentencesService');

module.exports.getAllEntitySentencesPOST = function getAllEntitySentencesGET (req, res, next) {
  GetAllEntitySentences.getAllEntitySentencesPOST(req.swagger.params, res, next);
};
