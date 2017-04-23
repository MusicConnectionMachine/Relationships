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

const classification = {
  inspire: ['inspired', 'influenced', 'motivated', 'provoked', 'impressed', 'excited', 'caused', 'liked', 'disliked'],
  live: ['lived', 'died on', 'died at', 'died in', 'born on', 'born at', 'born in'],
  teach: ['taught', 'coached', 'trained', 'educated', 'taught by',  'instructed'],
  student: ['learned from', 'scholar', 'student at','student of',  'pupil'],
  wrote: ['wrote',  'created',  'composed',  'compose',  'draw up',  'compile',  'write',  'indite'],
  perform: ['played', 'performed', 'executed']
};

const defaultConfig = {
  dbUri: 'postgres://postgres:a@35.184.197.125:5432/postgres',
  blobKey: 'unknown',
  relAlgorithms: ['35.184.211.19:80', '35.184.29.27:80'],
  coRefAlgorithms: [],
  eventAlgorithms: ['40.74.254.14:80'],
  semilarAlgorithm: '104.197.190.40:80/SemilarREST/rest/semilar',
  semilarAlgorithmThreshold: 0.5,
  classificationDescriptions: classification,
};

const envConfig = {
  dbUri: process.env.databaseUri,
  blobKey: process.env.blobkey,
  relAlgorithms: process.env.relalgorithms ? process.env.relalgorithms.split(','): null,
  coRefAlgorithms: process.env.corefalgorithms ? process.env.corefalgorithms.split(',') : null,
  eventAlgorithms: process.env.eventextractionalgorithms ? process.env.eventextractionalgorithms.split(',') : null,
  semilarAlgorithm: process.env.semilaralgorithm,
};


const paramConfig = {
  dbUri: commander.db,
  blobKey: commander.blobKey,
  relAlgorithms: commander.relExtraction,
  coRefAlgorithms: commander.coRef,
  eventAlgorithms: commander.eventExtraction,
  semilarAlgorithm: commander.semilar,
};

const finalConfig = {};

for (let key in defaultConfig) {
  finalConfig[key] = defaultConfig[key];
}

module.exports = finalConfig;
