#!/usr/bin/env node

const config = require('./app/cliConfig');
const db = require('./app/dbConnection');
const wetParser = require('./app/wetParser.js');
const algorithms = require('./app/algorithms');

db.writeDefaultRelationshipTypesAndDescriptions(config.classificationDescriptions)
  .then(() => {
    db.getWebsitesToEntities()
  })
  .then((blobPerEntity) => {
    return Promise.all(
      Object.keys(blobPerEntity).map(
        entity => handleEntityBlobs(blobPerEntity[entity])
      )
    );
  })
  .then(
    () => console.log('TODO: dump to database')
  )
  .then(
    () => console.log('done')
  );


function handleEntityBlobs(blobs) {
  return Promise.all(
    blobs.map(blobUrl => handleBlob(blobUrl))
  );

}

function handleBlob(blobUrl) {
  return wetParser.parse(blobUrl)
    .then(algorithms.call);
}
