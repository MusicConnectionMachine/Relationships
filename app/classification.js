'use strict';

var teacherArray = ['taught','coached', 'trained', 'educated'];
var studentArray = ['learned from'];
var wroteArray = ['wrote','created', 'composed'];
var playedArray = ['played','performed'];

var dict = {teacher:teacherArray, student:studentArray, wrote:wroteArray, played:playedArray};

module.exports.findRelationshipClass = function(word) {
	for(var key in dict) {
		var list = dict[key];
		for(var w in list) {
			if(list[w] === word) {
				return key;
			}
		}
	}
	return null;
};