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
  },
  'queue': {
    'namespace_access_key': 'IJ+f4X+iauM+ji9Dzjz7ZwZa+E7MUtiulcvv2Cu9A4M=',
    'namespace': 'relationshipns',
    'MaxSizeInMegabytes': '5120',
    'DefaultMessageTimeToLive': 'PT168H',
    'numberOfQueues': '10',
    'sendQueueNameOllieBase': 'submissionQueueOllie',
    'recvQueueNameOllieBase': 'completionQueueOllie',
    'sendQueueNameOpenIEBase': 'submissionQueueOpenIE',
    'recvQueueNameOpenIEBase': 'completionQueueOpenIE',
    'sendQueueNameEventsBase': 'submissionQueueEvents',
    'recvQueueNameEventsBase': 'completionQueueEvents',
  }
};
