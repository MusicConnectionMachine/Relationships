'use strict';

var url = require('url');

var GetAllSentences = require('./GetAllSentencesService');

module.exports.getAllSentencesPOST = function getAllSentencesPOST (req, res, next) {
  GetAllSentences.getAllSentencesPOST(req.swagger.params, res, next);
};
