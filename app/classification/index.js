'use strict';

const config        = require('../classification');
const natural       = require('natural');
const algorithms    = require('../algorithms');
const wordnet       = new natural.WordNet();
const classifier    = new natural.BayesClassifier();
const WordPOS       = require('wordpos'), wordpos = new WordPOS();
const snowball      = require('node-snowball');
const promiseQueue  = require('promise-queue');
const semilarQueue  = new promiseQueue(100, Infinity);
const fileParser    = require('../fileParser');
const path          = require('path');
const fs            = require('fs');
const stopwords     = getStopWords();
// read stopwords from dictionary
function getStopWords() {
  fs.readFile(path.join(__dirname, '..', '..', 'dictionaries', 'stop_words'), 'utf-8', function read(err, data) {
    if (err) {
      reject(err);
    } else {
      data = data.trim();
      data = data.split(/\r?\n/);
      return data;
    }
  });
}


function removeArrayElements (array, elementsToBeRemoved) {
  if(elementsToBeRemoved){
    return array.filter(element => elementsToBeRemoved.indexOf(element) === -1);
  }
  else return array;
}

exports.findRelationshipClass = function(word) {
  word = word.toLowerCase();
  for(let key in config.classificationDescriptions) {
    let list = config.classificationDescriptions[key];
    for(let w of list) {
      if(w === word) {
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
exports.filterMeaningfulVerb = function(relation) {
  let words = relation.split(' ');
  return Promise.all([
    wordpos.getNouns(relation),
    // wordpos.getAdjectives(relation),
    wordpos.getAdverbs(relation)
  ]).then(wordsToExclude => {
    const verbs = wordsToExclude.reduce((acc, x) => removeArrayElements(acc, x), words);
    switch(verbs.length) {
      case 0: return [relation];
      case 1: return verbs;
      default: return removeArrayElements(verbs, stopwords);
    }
  });
};

exports.stem = function (relation) {
  return snowball.stemword(relation);
};
