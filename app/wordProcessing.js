'use strict';

const WordPOS = require('wordpos'), wordpos = new WordPOS();
const snowball = require('node-snowball');

function removeArrayElements(array, elementsToBeRemoved) {
  elementsToBeRemoved.forEach(element => {
    var i = array.indexOf(element);
    if (i != -1) array.splice(i, 1);
  });
  return array;
}

// return string without nouns, adjectives, or adverbs
exports.filterMeaningfulVerb = function (relation) {
  let words = relation.split(' ');
  let customWordsToExclude = ['was', 'were', 'to', 'be', 'am', 'is', 'are', 'also', 'then', 'had', 'has', 'have'];
  return Promise.all([
    wordpos.getNouns(relation),
    // wordpos.getAdjectives(relation),
    wordpos.getAdverbs(relation)
  ]).then(wordsToExclude => {
    const verbs = wordsToExclude.reduce((acc, x) => removeArrayElements(acc, x), words);
    switch(verbs.length) {
      case 0: return [relation];
      case 1: return verbs;
      default: return removeArrayElements(verbs, customWordsToExclude);
    }
  });
};

exports.stem = function (relation) {
  return snowball.stemword(relation);
};
