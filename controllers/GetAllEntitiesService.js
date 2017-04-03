'use strict';
var request     = require('request');
var Tokenizer   = require('sentence-tokenizer');
var fs          = require('fs');
var tokenizer   = new Tokenizer('Chuck');
exports.getAllEntitiesPOST = function(args, res, next) {
  /**
   * Get the relationships from the given set of text array / file
   * The GetRelationships endpoint returns all the relationships found in the text by running an algorithm on it. The response includes relationship and two entities
   *
   * article String The Path of the file where the text is present
   * occurences List The occurence of entities present in the file
   * returns List
   **/
  var distinctEntities = [];
  var uniqueEntities = [];
  for( var i in args.occurences.value)
  {
    if( typeof(uniqueEntities[args.occurences.value[i].term]) == "undefined")
    {
      distinctEntities.push(args.occurences.value[i].term);
    }
    uniqueEntities[args.occurences.value[i].term] = 0;
  }

  if (Object.keys(distinctEntities).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(distinctEntities));
  } else {
    res.end();
  }
}

