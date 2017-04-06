'use strict';

const WordPOS = require('wordpos'), wordpos = new WordPOS();

function removeArrayElements(array, elementsToBeRemoved) {
  elementsToBeRemoved.forEach(element => {
    var i = array.indexOf(element);
    if(i != -1) array.splice(i, 1);
  });
  return array;
}

exports.getVerb = function(relation) {
  let words = relation.split(' ');

  return Promise.all([
    wordpos.getNouns(relation),
    wordpos.getAdjectives(relation),
    wordpos.getAdverbs(relation)
  ]).then(xs => {
    const verbs = xs.reduce((acc, x) => removeArrayElements(acc, x), words);
    const verbsString = verbs.reduce((acc, verb) => acc + ' ' + verb, '').slice(1);
    return verbsString ? verbsString : relation;
  });
};

exports.stem = function (relation) {
  return relation;
};
