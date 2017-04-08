'use strict';

const natural = require('natural');
const wordnet = new natural.WordNet();
const classifier = new natural.BayesClassifier();

const teacherArray = [ 'taught', 'coached', 'trained', 'educated', 'teached by',  'instructed'];
const studentArray = [ 'learned from', 'scholar', 'student at','student of',  'pupil',  'educatee' ];
const wroteArray = [ 'wrote',  'created',  'composed',  'compose',  'draw up',  'compile',  'write',  'indite' ];
const playedArray = ['played', 'performed', 'executed'];

const dict = {teacher:teacherArray, student:studentArray, wrote:wroteArray, played:playedArray};

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
        for (let value in result.synonyms) {
          array.push(result.synonyms[value]);
        }
      });
      array = Array.from(new Set(array));
      resolve(array);
    });
  }).catch(function() {
    console.log('Promise Rejected');
  });
}

module.exports.classify = function(word) {
  for(var value in teacherArray) {
    classifier.addDocument(teacherArray[value], 'teach');
  }
  for(var value in studentArray) {
    classifier.addDocument(studentArray[value], 'student');
  }
  for(var value in wroteArray) {
    classifier.addDocument(wroteArray[value], 'wrote');
  }
  for(var value in playedArray) {
    classifier.addDocument(playedArray[value], 'perform');
  }

  classifier.train();

  return classifier.getClassifications(word);
}
