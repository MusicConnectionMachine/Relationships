#!/usr/bin/env node

const config = require('./cli/config.js');
const db = require('./dbConnection/');
const wetParser = require('./fileParser/');
const algorithms = require('./algorithms/');

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
