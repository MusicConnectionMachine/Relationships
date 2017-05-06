// BASE SETUP
// =============================================================================
let socketNER   = require('./SocketNER.js');
let NER         = socketNER(1234, null , './StanfordNER/');
let express     = require('express');
let app         = express();
let clone       = require('clone');
let config      = require('./config');
let bodyParser  = require('body-parser');
let Tokenizer   = require('sentence-tokenizer');
let tokenizer   = new Tokenizer('Chuck');
//queue
const azure                 = require('azure');
const namespace             = config.queue.namespace;
const namespace_access_key  = config.queue.namespace_access_key;
const serviceBusService     = azure.createServiceBusService('Endpoint=sb://'+ namespace + '.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=' + namespace_access_key);
const totalQueuesCreated    = config.queue.numberOfQueues;

NER.init();
function findEvents(queueNumber)
{
  let exMessage = [];
  let events=
    {
      start: '',
      end: '',
      event:''
    };
  //check the queue for the message
  let queueName = config.queue.sendQueueNameBase + queueNumber;
  serviceBusService.receiveQueueMessage(queueName, {isPeekLock: true}, function (error, lockedMessage) {
    if (!error) {
      console.log(queueName + ' msg found');
      // Message received and locked
      let inputText = lockedMessage.body;
      if (inputText) {
        inputText = inputText.replace(/[^\x00-\x7F]/g, '');
        tokenizer.setEntry(inputText);
        let allSentences= tokenizer.getSentences();
        for(let sentence in allSentences) {
          let en= NER.getEntities(allSentences[sentence], '');
          if(en.DATE) {
            if(en.DATE[0]==undefined) en.DATE[0] = '';
            if(en.DATE[1]==undefined) en.DATE[1] = '';
            if(allSentences[sentence]==undefined) allSentences[sentence] = '';

            events.start= en.DATE[0];
            events.end= en.DATE[1];

            events.event=allSentences[sentence];
            let temp = clone(events);
            exMessage.push(temp);
          }
        }
        if(!lockedMessage.customProperties.entity)
          lockedMessage.customProperties.entity = '';

        let message = {
          body: JSON.stringify(exMessage),
          customProperties: {
            entity: lockedMessage.customProperties.entity
          }
        };
        let compqueueName = config.queue.recvQueueNameBase + queueNumber;
        return new Promise(function(resolve, reject) {
          serviceBusService.sendQueueMessage(compqueueName, message, function (error) {
            if (!error) {
              // message sent
              console.log('msg sent in queue ' + compqueueName);
              resolve();
            }
            else {
              console.log('error ' + error);
              return reject();
            }
          });
        }).then(()=>{
          serviceBusService.deleteMessage(lockedMessage, function (deleteError) {
            if (!deleteError) {
              // Message deleted
              console.log('msg deleted');
              queueNumber = (queueNumber + 1);
              if (queueNumber == totalQueuesCreated) {
                queueNumber = 0;
              }
              findEvents(queueNumber);

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
        findEvents(queueNumber);
      }

    }
    else {
      queueNumber = (queueNumber + 1);
      if (queueNumber == totalQueuesCreated) {
        queueNumber = 0;
      }
      findEvents(queueNumber);
    }
  });
}

let queueNumber = 0;
findEvents(queueNumber);

