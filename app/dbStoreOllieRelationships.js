#!/usr/bin/env node

const config                = require('./cli/config.js');
const db                    = require('./dbConnection/');
//queue
const azure                 = require('azure');
const config2               = require('./config');
const namespace             = config2.queue.namespace;
const namespace_access_key  = config2.queue.namespace_access_key;
const serviceBusService     = azure.createServiceBusService('Endpoint=sb://'+ namespace + '.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=' + namespace_access_key);
const totalQueuesCreated    = config2.queue.numberOfQueues;

function storeRelationships(queueNumber)
{
  //check the queue for the message
  let queueName = config2.queue.recvQueueNameOllieBase + queueNumber;
  serviceBusService.receiveQueueMessage(queueName, {isPeekLock: true}, function (error, lockedMessage) {
    if (!error) {
      console.log(queueName + ' msg found');
      // Message received and locked
      let relationshipJson = JSON.parse(lockedMessage.body);
      if (relationshipJson) {
          return new Promise(function(resolve, reject) {
            console.log(relationshipJson);
            db.writeRelationships(relationshipJson);
            resolve();
        }).then(()=>{
          serviceBusService.deleteMessage(lockedMessage, function (deleteError) {
            if (!deleteError) {
              // Message deleted
              console.log('msg deleted');
              queueNumber = (queueNumber + 1);
              if (queueNumber == totalQueuesCreated) {
                queueNumber = 0;
              }
              storeRelationships(queueNumber);

            }
            else {
              console.log(deleteError);
            }
          });
        });
      }
      else {
        console.log('send data properly');
        queueNumber = (queueNumber + 1);
        if (queueNumber == totalQueuesCreated) {
          queueNumber = 0;
        }
        storeRelationships(queueNumber);
      }
    }
    else {
      queueNumber = (queueNumber + 1);
      if (queueNumber == totalQueuesCreated) {
        queueNumber = 0;
      }
      storeRelationships(queueNumber);
    }
  });
}

let queueNumber = 0;
storeRelationships(queueNumber);
