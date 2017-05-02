const azure = require('azure');
const config = require('./config');
const namespace = config.queue.namespace;
const namespace_access_key = config.queue.namespace_access_key;

const serviceBusService = azure.createServiceBusService('Endpoint=sb://'+ namespace + '.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=' + namespace_access_key);
const queueOptions = {
  MaxSizeInMegabytes: config.queue.MaxSizeInMegabytes,
  DefaultMessageTimeToLive: config.queue.DefaultMessageTimeToLive
};
const totalQueuesToCreate = config.queue.numberOfQueues;


//queue Creations

for(let queueNumber = 0; queueNumber < totalQueuesToCreate; queueNumber++) {

  let queueName = config.queue.sendQueueNameBase + queueNumber;
  serviceBusService.createQueueIfNotExists(queueName, queueOptions, function(error){
    if(!error){
      // Queue exists
      console.log('queueCreated:' + queueName);
    }
    else
    {
      console.log('error: ' + error);
    }

  });
  let queueNameRecv = config.queue.recvQueueNameBase + queueNumber;
  serviceBusService.createQueueIfNotExists(queueNameRecv, queueOptions, function(error){
    if(!error){
      // Queue exists
      console.log('queueCreated:' + queueNameRecv);
    }
    else
    {
      console.log('error: ' + error);
    }

  });
}
