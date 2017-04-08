'use strict';

<<<<<<< HEAD
const natural = require('natural');
const wordnet = new natural.WordNet();

var teacherArray = ['taught','coached', 'trained', 'educated'];
var studentArray = ['learned from'];
var wroteArray = ['wrote','created', 'composed'];
var playedArray = ['played','performed'];
=======
const teacherArray = ['taught','coached', 'trained', 'educated'];
const studentArray = ['learned from'];
const wroteArray = ['wrote','created', 'composed'];
const playedArray = ['played','performed'];
>>>>>>> bd77b7899c4d1a719205fbe45eb1d6ddd32c240e

const dict = {teacher:teacherArray, student:studentArray, wrote:wroteArray, played:playedArray};

module.exports.findRelationshipClass = function(word) {
<<<<<<< HEAD
  word = word.toLowerCase();
=======
>>>>>>> bd77b7899c4d1a719205fbe45eb1d6ddd32c240e
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

function populateArray(array, word) {
  return new Promise(function (resolve) {
    wordnet.lookup(word, function (results) {
      results.forEach(function (result) {
        for (let value in result.synonyms) {
          array.push(result.synonyms[value]);
        }
      });
      array = Array.from(new Set(array));
      //console.log("TEST"+array);
      resolve(array);
    });
  }).catch(function() {
    console.log('Promise Rejected');
  });
}

function init(){
  for(let key in dict) {
    populateArray(dict[key], key);
  }
}

init();


/*populateArray(teacherArray, 'teach').then(() => {
  //console.log(teacherArray)
});
populateArray(studentArray, 'student').then(() => {
  //console.log(studentArray)
});
populateArray(wroteArray, 'write').then(() => {
  //console.log(wroteArray)
});
populateArray(playedArray, 'perform').then(() => {
  //console.log(playedArray)
}).then(function() {
  const classifier = new natural.BayesClassifier();

  for(var value in teacherArray) {
    classifier.addDocument(value, 'teach');
  }
  for(var value in studentArray) {
    classifier.addDocument(value, 'student');
  }
  for(var value in wroteArray) {
    classifier.addDocument(value, 'wrote');
  }
  for(var value in playedArray) {
    classifier.addDocument(value, 'perform');
  }
  classifier.train();

  console.log(playedArray);

  console.log(classifier.classify('do'));

  console.log('class: '+ classifier.getClassifications('do'));

});
*/
