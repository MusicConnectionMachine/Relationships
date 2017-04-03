'use strict';

// TODO: Implement CLI stuff here! (maybe)

//var dbConnection = require("app/DBConnection.js");
//dbConnection.

var wetFileParser = require("./app/WETParser.js");

wetFileParser.parse("../algorithms/openie-stanford/resources/test-data.wet");
