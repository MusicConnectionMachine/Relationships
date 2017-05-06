// config.js
module.exports = {
  'server':{
    'port': process.env.DATE_EXTRACTION_PORT || '3003',
    'host':  process.env.DATE_EXTRACTION_HOST || 'localhost'
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
