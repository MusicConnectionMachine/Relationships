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
  },
  'queue': {
    'namespace_access_key': 'IJ+f4X+iauM+ji9Dzjz7ZwZa+E7MUtiulcvv2Cu9A4M=',
    'namespace': 'relationshipns',
    'MaxSizeInMegabytes': '5120',
    'DefaultMessageTimeToLive': 'PT168H',
    'numberOfQueues': '10',
    'sendQueueNameBase': 'submissionQueue',
    'recvQueueNameBase': 'completionQueue',
  }
};
