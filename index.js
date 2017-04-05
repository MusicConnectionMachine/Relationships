'use strict';

const app = require('connect')();
const http = require('http');
const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const serverPort =  config.server.port;
// swaggerRouter configuration
const options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
const spec = fs.readFileSync('./internal-api/swagger.yaml', 'utf8');
const swaggerDoc = jsyaml.safeLoad(spec);

const utils = require('./app/utils.js');
const wetFileParser = require('./app/wetParser.js');
const dbConnection = require('./app/dbConnection.js');

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

// TODO: Get WET-file links from DB

//wetFileParser.parse('https://github.com/MusicConnectionMachine/UnstructuredData/files/850757/CC-MAIN-20170219104612-00150-ip-10-171-10-108.ec2.internal_filtered.warc.zip')

const testfile = 'mozart.txt';
console.log('Try to access file: ' + testfile);
utils.getTestFileContent(testfile)
  .then(allWebsites => {
    if (typeof(allWebsites) === 'string') {
      // only got one website
      processWebsite(allWebsites);
    } else if (allWebsites instanceof Array) {
      // multiple websites
      allWebsites.forEach(website => {
        processWebsite(website);
      })
    }
  }, error => {
    console.error(error);
  });

function processWebsite(website) {
  if (website) {
    console.log('Call CoRef');
    utils.callCoReferenceResolution(website)
      .catch((error) => {
        // first catch the error, then work on in then()
        console.error('CoRef: ' + error);
      }).then((replacedCorefs) => {
        if (!replacedCorefs) {
          // previous error, or no data from coref, let's just use the website data from before
          replacedCorefs = website;
        }
        console.log('Call DateEventExcraction');
        utils.callDateEventExtraction(replacedCorefs)
          .then(result => {
            if (result) {
              if (typeof(result) === 'string') {
                console.log('DateEventExcraction: Result is a String: ' + result);
              } else {
                // write to db
                console.log('DateEventExcraction: Write JSON to DB');
                dbConnection.writeEvents(result);
              }
            }
          }, error => {
            console.error('DateEventExcraction: ' + error);
          });
        console.log('Call Ollie');
        utils.callOllie(replacedCorefs)
          .then(result => {
            if (result) {
              if (typeof(result) === 'string') {
                console.log('Ollie: Result is a String: ' + result);
              } else {
                // write to db
                console.log('Ollie: Write JSON to DB');
                dbConnection.writeEvents(result);
              }
            }
          }, error => {
            console.error('Ollie: ' + error);
          });
      });
  }
}


