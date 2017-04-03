'use strict';
var request     = require('request');
var Tokenizer   = require('sentence-tokenizer');
var fs          = require('fs');
var tokenizer   = new Tokenizer('Chuck');
exports.getAllEntitySentencesPOST = function(args, res, next) {
  /**
   * Get the relationships from the given set of text array / file
   * The GetRelationships endpoint returns all the relationships found in the text by running an algorithm on it. The response includes relationship and two entities
   *
   * article String The Path of the file where the text is present
   * occurences List The occurence of entities present in the file
   * returns List
   **/
  var AllEntitySentences =[];

  fs.readFile(args.article.value, 'utf8', function (err, data)
  {
    if (err) throw err;
    tokenizer.setEntry(data);
    var allSentences= tokenizer.getSentences();

    for(var entityNumber=0; entityNumber<args.occurences.value.length; entityNumber++)
    {
      AllEntitySentences[entityNumber]=[];
      for (var sentenceNumber = 0; sentenceNumber < allSentences.length; sentenceNumber++)
      {
        var tokens = tokenizer.getTokens(sentenceNumber);
        var entity = args.occurences.value[entityNumber].term;
        // here to add the logic of understanding the pronouns
        if (tokens.indexOf(entity) > -1)
        {
          AllEntitySentences[entityNumber].push(allSentences[sentenceNumber]);
          //console.log("In the array");
        } else
        {
          //console.log("Not in the array");
        }
      }
    }
    if (Object.keys(AllEntitySentences).length > 0) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(AllEntitySentences));
    } else {
      res.end();
    }
  });

}

