const commander = require('commander');

function collect(val, memo) {
  memo.push(val);
  return memo;
}

commander
  .option('-d, --db [host]:[port]', 'database connection string, e.g. "postgres://user:passwd@127.0.0.1:5432/db"')
  .option('-k, --blob-key [storageKey]', 'blob storage access key, e.g. "AZURE_KEY_HERE"')
  .option('-r, --rel-extraction [location]', 'location of the algorithm to run (option can be repeated)', collect, [])
  .option('-c, --co-ref [location]', 'location of the algorithm to run (option can be repeated)', collect, [])
  .option('-e, --event-extraction [location]', 'location of the algorithm to run (option can be repeated)', collect, [])
  .option('-s, --semilar [location]', 'location of the algorithm to run')
  .parse(process.argv);

const defaultConfig = {
  dbUri: null,
  blobKey: 'unknown',
  relAlgorithms: [],
  coRefAlgorithms: [],
  dateAlgorithms: [],
  semilarAlgorithm: null,
};

const envConfig = {
  dbUri: process.env.databaseUri,
  blobKey: process.env.blobkey,
  relAlgorithms: process.env.relalgorithms ? process.env.relalgorithms.split(','): null,
  coRefAlgorithms: process.env.corefalgorithms ? process.env.corefalgorithms.split(',') : null,
  dateAlgorithms: process.env.datealgorithms ? process.env.datealgorithms.split(',') : null,
  semilarAlgorithm: process.env.semilaralgorithm,
};


const paramConfig = {
  dbUri: commander.db,
  blobKey: commander.blobKey,
  relAlgorithms: commander.relExtraction,
  coRefAlgorithms: commander.coRef,
  dateAlgorithms: commander.dateExtraction,
  semilarAlgorithm: commander.semilar,
};

const finalConfig = {};

for (let key in defaultConfig) {
  finalConfig[key] = paramConfig[key] || envConfig[key] || defaultConfig[key];
}

module.exports = finalConfig;
