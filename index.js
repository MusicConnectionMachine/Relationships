'use strict';

var app = require('connect')();
var http = require('http');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var config = require('./config');
var serverPort =  config.server.port;

// swaggerRouter configuration
var options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./internal-api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Start the server
  http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
  });
});

// Call chain
getFileContent('mozart.txt') // sample file for now
  .catch(function (error) {
    console.log('error: reading file: ' + error);
    return;
  }).then(function (text) {
    console.log('got data from wet: ' + text);
    // TODO: process WET file
    // TODO: call algorithms

  }).catch(function (error) {
    console.log('error: calling algorithms: ' + error);
    return;
  }).then(function (result) {
    // TODO: dump to db
    // TODO: classify -> db
  });





function getFileContent(filename) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, '/example') + '/' + filename, 'utf-8', function read(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function splitWet(data) {
  // get websites from wet
  data = data.split("\n\n\n");

  // filter out warc info, TODO: we may need that data later
  // TODO: use more than one website (still testing)
  var content = data[0].split("\n\n")[1];

  // TODO: delete this later, just try to prevent timeout
  content = content.substring(0, 100);

  return content;
}

/**
 * Store the given data as files on local storage, subfolder 'output'.
 * @param filename the name of the file, without extension, will always be .json
 * @param data the json object containing the data
 */
function saveToFS(filename, data) {
  if (!config.save_to_fs) {
    return;
  }
  var dir = path.join(__dirname, '/output');
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  fs.writeFile(dir + '/' + filename + ".json", JSON.stringify(data), 'utf-8', function(err) {
    if(err) {
      return console.log(err);
    }

    console.log(filename + " was saved!");
  });
}

/**
 * TODO: implement save to db logic here, maybe just call the API from here.
 */
function saveToDB() {
  if (!config.save_to_db) {
    return;
  }
  // TODO: logic here
}

