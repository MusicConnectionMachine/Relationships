var spawn = require("child_process").spawn;
var deasync = require("deasync");

function socketNER(port, classifierFileName, pathToNER) {
  this.port = port || 1234;
  this.classifier = classifierFileName || "english.muc.7class.distsim.crf.ser.gz";
  this.pathToNER = pathToNER || "/";
  this.server = undefined;
  this.client = undefined;
}

socketNER.prototype.startServer = deasync(function (cb) {
  var self = this;
  self.server = spawn(
    "java",[
      "-mx750m", "-cp",
      self.pathToNER + "stanford-ner.jar",
      "edu.stanford.nlp.ie.NERServer",
      "-loadClassifier", self.pathToNER + self.classifier,
      "-port", self.port, "-outputFormat", "inlineXML"
    ]
  );
  // I don't know why server's stderr stream gets
  // all output and why stdout don't.
  self.server.stderr.on("data", reader);
//  console.log(self.server);
  // Server would finish loading, when it flushes
  // out 'done [x secs]'
  function reader(data) {
    if (data.toString().search("done") > -1) {
      // Removing listener
      self.server.stderr.removeListener("data", reader);
      cb(null, true)
    }
  }
});

socketNER.prototype.startClient = deasync(function (cb) {
  var self = this;
  self.client = spawn(
    "java",[
      "-cp",
      self.pathToNER + "stanford-ner.jar",
      "edu.stanford.nlp.ie.NERServer",
      "-port", self.port, "-client"
    ]
  );
  //console.log(self.client);
  self.client.stdout.once("data", function (data) {
    if (data.toString().trim().match(/^Input some text/g)) {
      cb(null, true)
    }
  })
});

socketNER.prototype.init = function () {
  var self = this;
  self.startServer();
  self.startClient();
  console.log("endint");
};

socketNER.prototype.close = function () {
  var self = this;
  self.server.kill();
  self.client.kill();
};

socketNER.prototype.getEntities = function (rawText, reqEntity) {
  var self = this;
  rawText = rawText.replace(/[\r\n\f\t\v]/g, " ") + "\n";
  return self.tagIt(rawText, reqEntity)
};

socketNER.prototype.tagIt = deasync(function (rawText, reqEntity, cb) {
  var self = this;
  // Emptying the readable stream to make it writable
  self.client.stdout.read();
  // Writing to writable stream to push rawText to NER server
  self.client.stdin.write(rawText);
  // Processing data when NER server sends back data to stream
  // making stream readable again. "data" event would emptify the
  // readable stream to make it writable again.
  self.client.stdout.once("data", function (data) {
    // Trim() is necessary to avoid leading and follwing line breaks.
    var taggedText = data.toString().trim();
    // Synchronize module follows (err, data) format for cb.
    cb(null, self.parser(taggedText, reqEntity))
  })
});

socketNER.prototype.parser = function (taggedText, reqEntity) {
  var matches, entities = {}; // return value of parser function
  reqEntity = reqEntity ? reqEntity.toUpperCase() : "";
  var re = reqEntity ? new RegExp(["<(",reqEntity,"?)>(.*?)<\/",reqEntity,"?>"].join(""), "g")
    : /<([A-Z]+?)>(.*?)<\/[A-Z]+?>/g;
  while((matches = re.exec(taggedText)) !== null) {
    if (entities[matches[1]]) {
      // if tagName is present, then pushing in the tagValue Array
      entities[matches[1]].push(matches[2])
    }
    else {
      // otherwise adding the tagName with a new tagValue Array
      entities[matches[1]] = [matches[2]]
    }
  }
  return entities
};

module.exports = function (port, classifierFileName, pathToNER) {
  return new socketNER(port, classifierFileName, pathToNER)
};
