'use strict';

const config = require('./config');

const natural = require('natural');
const algorithms = require('./algorithms');
const wordnet = new natural.WordNet();
const classifier = new natural.BayesClassifier();

const teacherArray = [ 'taught', 'coached', 'trained', 'educated', 'teached by',  'instructed'];
const studentArray = [ 'learned from', 'scholar', 'student at','student of',  'pupil',  'educatee' ];
const wroteArray = [ 'wrote',  'created',  'composed',  'compose',  'draw up',  'compile',  'write',  'indite' ];
const playedArray = ['played', 'performed', 'executed'];

const dict = {teacher:teacherArray, student:studentArray, wrote:wroteArray, played:playedArray};

const promiseQueue = require('promise-queue');
const semilarQueue = new promiseQueue(100, Infinity);

module.exports.findRelationshipClass = function(word) {
  word = word.toLowerCase();
  for(let key in dict) {
    let list = dict[key];
    for(let w in list) {
      if(list[w] === word) {
        return key;
      }
    }
  }
  return null;
};

module.exports.addSynonymsToArray = function(array, word) {
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

module.exports.classify = function(word) {
  for(let value of teacherArray) {
    classifier.addDocument(value, 'teach');
  }
  for(let value of studentArray) {
    classifier.addDocument(value, 'student');
  }
  for(let value of wroteArray) {
    classifier.addDocument(value, 'wrote');
  }
  for(let value of playedArray) {
    classifier.addDocument(value, 'perform');
  }

  classifier.train();

  return classifier.getClassifications(word);
};

module.exports.getSemilarType = function(word) {
  const promises = [];

  for(let wordType in dict) {
    let wordList = dict[wordType];
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
