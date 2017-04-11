#!/usr/bin/env node

const config = require('./app/config');
const db = require('./app/dbConnection');
const algorithms = require('./app/algorithms');


db.getWebsitesToEntities()
  .then(
    (websites) => algorithms.call(websites)
  )
  .then(
    () => console.log('TODO: dump to database')
  )
  .then(
    () => console.log('done')
  );
