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
const algorithms = require('./app/algorithms.js');


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
// get all websites for all entities from the DB
dbConnection.getWebsitesToEntities()
  .then(blobPerEntity => {
    Object.keys(blobPerEntity).forEach(entityId => {
      // for every entity
      blobPerEntity[entityId].forEach(blobUrl => {
        // for every blob url in every entity, parse the wet file
        wetFileParser.parse(blobUrl)
          .then(allWebsites => {
            algorithms.call(allWebsites);
          }, error => {
            console.error(error);
          });
      });
    });
  });


