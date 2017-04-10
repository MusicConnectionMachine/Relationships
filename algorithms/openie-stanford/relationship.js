const StanfordCoreNLPClient = require('./StanfordCoreNLPClient');

const filter = require('./relationship.filter.js');

const client = new StanfordCoreNLPClient(
  undefined,
  'tokenize, ssplit, pos, depparse, relation, openie'
);

let data = '';

// call client
exports.call = function (text, callback) {
  client.annotate(text).then(function (result) {
    data = filter.filterOpenIE(result);
    callback(data);
  });
};
