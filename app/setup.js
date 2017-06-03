const azure = require('azure');
const config = require('./config');
const namespace = config.queue.namespace;
const namespace_access_key = config.queue.namespace_access_key;

const serviceBusService = azure.createServiceBusService('Endpoint=sb://'+ namespace + '.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=' + namespace_access_key);
const queueOptions = {
  MaxSizeInMegabytes: config.queue.MaxSizeInMegabytes,
  DefaultMessageTimeToLive: config.queue.DefaultMessageTimeToLive,
  LockDuration: config.queue.LockDuration
};
const totalQueuesToCreate = config.queue.numberOfQueues;


//queue Creations

for(let queueNumber = 0; queueNumber < totalQueuesToCreate; queueNumber++) {

  let queueNameOllie = config.queue.sendQueueNameOllieBase + queueNumber;
  serviceBusService.createQueueIfNotExists(queueNameOllie, queueOptions, function(error){
    if(!error){
      // Queue exists
      console.log('queueCreated:' + queueNameOllie);
    }
    else
    {
      console.log('error: ' + error);
    }

  });
  let queueNameRecvOllie = config.queue.recvQueueNameOllieBase + queueNumber;
  serviceBusService.createQueueIfNotExists(queueNameRecvOllie, queueOptions, function(error){
    if(!error){
      // Queue exists
      console.log('queueCreated:' + queueNameRecvOllie);
    }
    else
    {
      console.log('error: ' + error);
    }

  });
  let queueNameOpenIE = config.queue.sendQueueNameOpenIEBase + queueNumber;
  serviceBusService.createQueueIfNotExists(queueNameOpenIE, queueOptions, function(error){
    if(!error){
      // Queue exists
      console.log('queueCreated:' + queueNameOpenIE);
    }
    else
    {
      console.log('error: ' + error);
    }

  });
  let queueNameRecvOpenIE = config.queue.recvQueueNameOpenIEBase + queueNumber;
  serviceBusService.createQueueIfNotExists(queueNameRecvOpenIE, queueOptions, function(error){
    if(!error){
      // Queue exists
      console.log('queueCreated:' + queueNameRecvOpenIE);
    }
    else
    {
      console.log('error: ' + error);
    }

  });
  let queueNameEvents = config.queue.sendQueueNameEventsBase + queueNumber;
  serviceBusService.createQueueIfNotExists(queueNameEvents, queueOptions, function(error){
    if(!error){
      // Queue exists
      console.log('queueCreated:' + queueNameEvents);
    }
    else
    {
      console.log('error: ' + error);
    }

  });
  let queueNameRecvEvents = config.queue.recvQueueNameEventsBase + queueNumber;
  serviceBusService.createQueueIfNotExists(queueNameRecvEvents, queueOptions, function(error){
    if(!error){
      // Queue exists
      console.log('queueCreated:' + queueNameRecvEvents);
    }
    else
    {
      console.log('error: ' + error);
    }

  });

}
