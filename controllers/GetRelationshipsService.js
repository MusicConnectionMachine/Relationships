'use strict';

exports.getRelationshipsGET = function(args, res, next) {
  /**
   * Get the relationships from the given set of text array / file
   * The GetRelationships endpoint returns all the relationships found in the text by running an algorithm on it. The response includes relationship and two entities
   *
   * article String The Path of the file where the text is present
   * occurences List The occurence of entities present in the file
   * returns List
   **/
  var examples = {};
  examples['application/json'] = [ {
  "entity1" : "aeiou",
  "entity2" : "aeiou",
  "relation" : "aeiou"
} ];
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}

