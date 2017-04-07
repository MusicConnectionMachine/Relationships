'use strict';

const teacherArray = ['taught','coached', 'trained', 'educated'];
const studentArray = ['learned from'];
const wroteArray = ['wrote','created', 'composed'];
const playedArray = ['played','performed'];

const dict = {teacher:teacherArray, student:studentArray, wrote:wroteArray, played:playedArray};

module.exports.findRelationshipClass = function(word) {
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
