const jsonQuery = require('json-query');

/**
 * returns a json with all relations in the 'instances' attribute in the format:
 * {'term1': <...>, 'relation': <...>, 'term2': <...>}
 * TODO: include real sentence attribute in order to have same structure as other algorithms (currently dymmy)
 * @param json
 */
exports.filterOpenIE = function (json) {
  console.log('called filter openie');
  checkJSON(json);
  var data = jsonQuery('sentences[*openie]', {
    data: json
  });

  console.log(data);
  data = data.value;
  console.log(data);

  // TODO: Maybe calculate the position in the whole text
  // maps only relevant parts
  data = data.map(function (x) {
    return {'term1': x.subject, 'relation': x.relation, 'term2': x.object};
  });
  return {
    'sentence' : '',
    'instances': data
  };
};

exports.filterDates = function (json) {
  console.log('called filter dates');
  checkJSON(json);
  var data = jsonQuery('sentences[*entitymentions][*ner=DATE]', {
    data: json,
  });
  data = data.value;
  // TODO: combine with relations.
  return data;
};


exports.filterKBP = function (json, searchText) {
  // TODO: filter here
  console.log('called filter kbp');
  checkJSON(json);
};

exports.filterCorefs = function (json, searchText) {
  console.log('called filter corefs');
  checkJSON(json);

  // get corefs keys
  var data = jsonQuery('corefs[**][*text = ' + searchText + ']', {
    data: json
  });
  var corefsValuesLengths = Object.values(json.corefs).map(x => x.length);
  var corefKeys = [];
  data.key.forEach(function (objectIndex) {
    var corefKeyIndex = 0;
    while (objectIndex + 1 > corefsValuesLengths[corefKeyIndex]) {
      objectIndex -= corefsValuesLengths[corefKeyIndex];
      corefKeyIndex++;
    }
    var corefKey = Object.keys(json.corefs)[corefKeyIndex];
    if (corefKeys.indexOf(corefKey) == -1) {
      corefKeys.push(corefKey);
    }
  });

  // get corefs
  var corefs = corefKeys.map(key => json.corefs[key]);

  // flatten array
  corefs = [].concat.apply([], corefs);

  corefs.forEach(function (coref) {
    //console.log(json.sentences[coref.sentNum - 1]);

  });

  // TODO: handle every sentence where the same person is mentioned.
  console.log(corefs);

  return corefs;
};

function checkJSON(json) {
  if (!json) {
    throw 'JSON is not valid';
  }
}
