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
  ]).then(xs => {
    xs.push(customWordsToExclude);
    const verbs = xs.reduce((acc, x) => removeArrayElements(acc, x), words);
    return verbs ? verbs : relation;
  });
};

exports.stem = function (relation) {
  return snowball.stemword(relation);
};

exports.array2String = function (array) {
  return array.reduce((acc, word) => acc + ' ' + word, '').slice(1);
}
