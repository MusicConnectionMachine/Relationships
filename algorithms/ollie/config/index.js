// config.js
module.exports = {
  'server':{
    'port': process.env.OLLIE_PORT || '3000',
    'host':  process.env.OLLIE_HOST || 'localhost'
  },
  'ollieAlgo': {
    'name':'ollie-app-latest.jar',
    'javaOpt':'-Xmx512m',
    'defaultFileInputPath': 'example/input.txt',
    'LimitRelationWordCount': 5
  }
};
