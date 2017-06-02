// config.js
module.exports = {
  'queue': {
    'namespace_access_key': 'IJ+f4X+iauM+ji9Dzjz7ZwZa+E7MUtiulcvv2Cu9A4M=',
    'namespace': 'relationshipns',
    'MaxSizeInMegabytes': '5120',
    'DefaultMessageTimeToLive': 'PT168H',
    'LockDuration': 'PT3M',
    'numberOfQueues': '10',
    'sendQueueNameOllieBase': 'submissionQueueOllie',
    'recvQueueNameOllieBase': 'completionQueueOllie',
    'sendQueueNameOpenIEBase': 'submissionQueueOpenIE',
    'recvQueueNameOpenIEBase': 'completionQueueOpenIE',
    'sendQueueNameEventsBase': 'submissionQueueEvents',
    'recvQueueNameEventsBase': 'completionQueueEvents',
  },
};
