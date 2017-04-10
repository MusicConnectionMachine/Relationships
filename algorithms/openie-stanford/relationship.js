const StanfordCoreNLPClient = require('./StanfordCoreNLPClient');

const filter = require('./relationship.filter.js');

const client = new StanfordCoreNLPClient(
  undefined,
  'tokenize, ssplit, pos, depparse, relation, openie'
);

// call client
exports.call = function (text, callback) {
  client.annotate(text).then(function (result) {
    let data = filter.filterOpenIE(result);
    callback(data);
  });
};
