'use strict';
var request     = require('request');
var Tokenizer   = require('sentence-tokenizer');
var fs          = require('fs');
var tokenizer   = new Tokenizer('Chuck');
exports.getAllSentencesPOST = function(args, res, next) {
  /**
   * Get the relationships from the given set of text array / file
   * The GetRelationships endpoint returns all the relationships found in the text by running an algorithm on it. The response includes relationship and two entities
   *
   * article String The Path of the file where the text is present
   * occurences List The occurence of entities present in the file
   * returns List
   **/
  var examples = {};
  examples['application/json'] = [ "aeiou" ];
  fs.readFile(args.article.value, 'utf8', function (err, data)
  {
    if (err)
      console.log( err);
    tokenizer.setEntry(data);
    var allSentences= tokenizer.getSentences();

    if (Object.keys(allSentences).length > 0) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(allSentences));
    } else {
      res.end();
    }

  });
}

