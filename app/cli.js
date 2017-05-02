#!/usr/bin/env node

const config                = require('./cli/config.js');
const db                    = require('./dbConnection/');
const wetParser             = require('./fileParser/');
const algorithms            = require('./algorithms/');
const web                   = require('./webGui');
//queue
const azure                 = require('azure');
const config2               = require('./config');
const namespace             = config2.queue.namespace;
const namespace_access_key  = config2.queue.namespace_access_key;
const serviceBusService     = azure.createServiceBusService('Endpoint=sb://'+ namespace + '.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=' + namespace_access_key);
const totalQueuesCreated    = config2.queue.numberOfQueues;

exports.mainCall = function() {
  db.writeDefaultRelationshipTypesAndDescriptions(config.classificationDescriptions)
    .then(() => {
      return db.getPromisingWebsites();
    }).then(allWebsites => {
      let queueNumber = 0;
      return Promise.all(allWebsites.map(function(blobUrl) {
        return new Promise(function(resolve, reject) {
          let queueName = config2.queue.sendQueueNameBase + queueNumber;
          let message = {
            body: blobUrl,
            customProperties: {
              testproperty: 'TestValue'
            }
          };
          serviceBusService.sendQueueMessage(queueName, message, function (error) {
            if (!error) {
              // message sent
              console.log('msg sent in queue ' + queueName);
              queueNumber = (queueNumber + 1);
              if (queueNumber === totalQueuesCreated) {
                queueNumber = 0;
              }
              resolve();

            }
            else {
              console.log('error ' + error);
              queueNumber = (queueNumber + 1);
              if (queueNumber === totalQueuesCreated) {
                queueNumber = 0;
              }
              return reject(err);
            }
          });

        });
      })).then(function() { console.log('all sent' ); })
        .catch(error => {
          console.error(error);
        });
    })
    .catch(error => {
      console.error(error);
    });
};

exports.mainCall();
