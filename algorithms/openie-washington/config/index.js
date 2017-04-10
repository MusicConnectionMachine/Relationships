// config.js
module.exports = {
  'server':{
    'host': process.env.OPENIE_WASHINGTON_HOST || 'localhost',
    'port': process.env.OPENIE_WASHINGTON_PORT || '3001'
  },
  'openieAlgo': {
    'name':'openie-assembly-4.2.2-SNAPSHOT.jar',
    'javaOpt':'-Xmx4g -XX:+UseConcMarkSweepGC',
    'format': '--format column',
    'defaultInputFilePath': 'example/input.txt',
    'LimitRelationWordCount': 3
  }
};
