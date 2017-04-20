'use strict';

const config        = require('../Classification/functions.js');
const natural       = require('natural');
const algorithms    = require('../Algorithms/functions.js');
const wordnet       = new natural.WordNet();
const classifier    = new natural.BayesClassifier();
const WordPOS       = require('wordpos'), wordpos = new WordPOS();
const snowball      = require('node-snowball');
const stopwords     = ['was', 'were', 'to', 'be', 'am', 'is', 'are', 'also', 'then', 'had', 'has', 'have'];
const promiseQueue  = require('promise-queue');
const semilarQueue  = new promiseQueue(100, Infinity);

exports.removeArrayElements = function(array, elementsToBeRemoved) {
  return array.filter(element => elementsToBeRemoved.indexOf(element) == -1);
};

exports.findRelationshipClass = function(word) {
  word = word.toLowerCase();
  for(let key in config.classificationDescriptions) {
    let list = config.classificationDescriptions[key];
    for(let w in list) {
      if(list[w] === word) {
        return key;
      }
    }
  }
  return null;
};

exports.addSynonymsToArray = function(array, word) {
  return new Promise(function (resolve) {
    wordnet.lookup(word, function (results) {
      results.forEach(function (result) {
        array.concat(result.synonyms);
      });
      array = Array.from(new Set(array));
      resolve(array);
    });
  }).catch(function() {
    console.log('Promise Rejected');
  });
};

exports.classify = function(word) {
  Object.keys(config.classificationDescriptions).forEach((key) => {
    config.classificationDescriptions[key].forEach((value) => {
      classifier.addDocument(value, key);
    });
  });

  classifier.train();

  return classifier.getClassifications(word);
};

exports.getSemilarType = function(word) {
  const promises = [];

  for(let wordType in config.classificationDescriptions) {
    let wordList = config.classificationDescriptions[wordType];
    for (let comparisonWord of wordList) {
      const promise = semilarQueue.add(() => algorithms.callSemilar(word, comparisonWord))
        .then(result => {
          return {type: wordType, similarity: result};
        }, {type: null, similarity: 0});
      promises.push(promise);
    }
  }

  return Promise.all(promises)
    .then((results) => {
      return results.reduce((finalType, result) => {
        return (result.similarity > finalType.similarity) ? result : finalType;
      }, {type: null, similarity: config.semilarAlgorithmThreshold})
    }).catch(() => {
      return {type: null, similarity: 0};
    });
};

// return string without nouns, adjectives, or adverbs
exports.filterMeaningfulVerb = function (relation) {
  let words = relation.split(' ');
  return Promise.all([
    wordpos.getNouns(relation),
    // wordpos.getAdjectives(relation),
    wordpos.getAdverbs(relation)
  ]).then(wordsToExclude => {
    const verbs = wordsToExclude.reduce((acc, x) => util.removeArrayElements(acc, x), words);
    switch(verbs.length) {
      case 0: return [relation];
      case 1: return verbs;
      default: return util.removeArrayElements(verbs, stopwords);
    }
  });
};

exports.stem = function (relation) {
  return snowball.stemword(relation);
};
