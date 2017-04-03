'use strict';

var utils = require("./Utils.js");

exports.parse = function(args) {
  utils.getFileContentLocal(args)
    .catch(function (error) {
      console.error(error);
      console.log('error: reading file');
      return;
    }).then(function (data) {
      console.log(data);
      data = splitWET(data);
      // TODO: Call Coref and other algorithms
      return data;
    });
};

function splitWET(data) {
  // get websites from wet
  data = data.split("\n\n\n");

  // filter out warc info, TODO: we may need that data later
  // TODO: use more than one website (still testing)
  var content = data[0].split("\n\n")[1];

  // TODO: delete this later, just try to prevent timeout
  content = content.substring(0, 100);

  return content;
}

