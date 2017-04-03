'use strict';

const apiLocation = "../api/"
const api = require(apiLocation + "database.js");

var context = null;

function connect() {
  if (!context) {
    api.connect(function(localContext) {
      context = localContext;
    });
  }
}

module.exports.getAllComposers = function () {
  connect();
  // TODO: Access the DB
};
