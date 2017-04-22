#!/usr/bin/env node

const config = require('./Cli/config.js');
const db = require('./DbConnection/functions.js');
const wetParser = require('./FileParser/functions.js');
const algorithms = require('./Algorithms/functions.js');

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
