#!/usr/bin/env node

const commander = require('commander');
const pgdb=require('./example/fillDatabase.js');
const wetparser=require('./app/wetParser.js');

function collect(val, memo) {
  memo.push(val);
  return memo;
}

commander
  .option('-d, --db [host]:[port]', 'database connection string, e.g. "postgres://user:passwd@127.0.0.1:5432/db"')
  .option('-k, --blob-key [storageKey]', 'blob storage access key, e.g. "AZURE_KEY_HERE"')
  .option('-r, --rel-extraction [host]:[port]/[path]', 'location of the algorithm to run (option can be repeated)', collect, [])
  .option('-c, --co-ref [algorithm]', 'location of the algorithm to run (option can be repeated)', collect, [])
  .option('-a, --date-extraction [algorithm]', 'location of the algorithm to run (option can be repeated)', collect, [])
  .parse(process.argv);

const defaultConfig = {
  dbHost: '172.0.0.1',
  dbPort: 5432,
  dbUser: 'postgres',
  dbPassword: 'NotRequired',
  blobAccount: 'wetstorage',
  blobContainer: 'websites',
  blobKey: 'unknown',
};

const relExtraction=commander.RelExtraction||process.env.r;
const coRef=commander.CoRef||process.env.c;
const dateExtraction=commander.DateExtraction||process.env.a;


if(commander.db){
  pgdb.populateDB();
}
if(commander.blobKey){
  wetparser.parse();
}

const envConfig = {
  relAlgorithms:[],
  host:[],
  port:[],
  path:[]
};


if(relExtraction=='Ollie'){
  envConfig.push({relAlgorithm:'Ollie',host:'localhost', port:'3000'});
  console.log('running Ollie');
}
if(relExtraction=='OpenieWashington'){
  envConfig.push({host:'localhost',port:'3001'});
  console.log('running OpenWashington');
}
if(relExtraction=='OpenieStandardford'){
  envConfig.push({host:'localhost',port:'3002'});
  console.log('running OpenStandford');
}




//const db = commander.blobLocation.split(":", 2);
const paramConfig = {
  dbUri: commander.db,
};

const finalConfig = Object.assign({}, defaultConfig, envConfig, paramConfig);

console.log('Configuration: ', finalConfig);
