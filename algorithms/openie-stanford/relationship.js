const config = require('./config.json');
const StanfordCoreNLPClient = require('./StanfordCoreNLPClient');

const filter = require('./relationship.filter.js');

const client = new StanfordCoreNLPClient(
  undefined,
  'tokenize, ssplit, pos, depparse, relation, openie, ner'
);

var data = '';

// call client
exports.call = function (text, callback) {
  console.log(text);
  client.annotate(text).then(function (result) {
    data = filter.filterOpenIE(result);
    console.log(JSON.stringify(data));
    callback(data);

    // TODO:
    var dates = filter.filterDates(result);
    console.log(JSON.stringify(dates));
  });
};
