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
        wetParser.parse(blobUrl, 'output')
          .then(websites => {
            websites.map(website => {
              let contentarr = website.content;
              let header = website.header;
              let entity = algorithms.parseHeader(header);
              if (!(contentarr instanceof Array)) {
                // websites has to be an array
                contentarr = [contentarr];
              }
              let promises = [];
              // multiple websites
              contentarr.forEach(content => {
                // do the algorithm calls
                if (content && header) {
                  return new Promise((resolve) => {
                    let queueNameOllie = config2.queue.sendQueueNameOllieBase + queueNumber;
                    let queueNameOpenIE = config2.queue.sendQueueNameOpenIEBase + queueNumber;
                    let queueNameEvents = config2.queue.sendQueueNameEventsBase + queueNumber;
                    let message = {
                      body: content,
                      customProperties: {
                        entity: entity
                      }
                    };
                    queueNumber = (queueNumber + 1);
                    if (queueNumber == totalQueuesCreated) {
                      queueNumber = 0;
                    }
                    serviceBusService.sendQueueMessage(queueNameOllie, message, function (error) {
                      if (!error) {
                        // message sent
                        console.log('msg sent in queue ' + queueNameOllie);
                        serviceBusService.sendQueueMessage(queueNameOpenIE, message, function (error) {
                          if (!error) {
                            // message sent
                            console.log('msg sent in queue ' + queueNameOpenIE);

                            serviceBusService.sendQueueMessage(queueNameEvents, message, function (error) {
                              if (!error) {
                                // message sent
                                console.log('msg sent in queue ' + queueNameEvents);

                                resolve();
                              }
                              else {
                                console.log('error ' + error);
                                return reject();
                              }

                            });
                          }
                          else {
                            console.log('error ' + error);
                            return reject();
                          }

                        });
                      }
                      else {
                        console.log('error ' + error);
                        return reject();
                      }
                    });
                  }).then(promise =>{
                    promises.push(promise);
                  });
                }
              });
              Promise.all(promises).then(function(){
                resolve();
              });
            })
          }, error => {
            console.error(error);
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
