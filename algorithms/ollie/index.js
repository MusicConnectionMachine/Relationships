// BASE SETUP
// =============================================================================
const express     = require('express');
const app         = express();
const clone       = require('clone');
const config      = require('./config');
const bodyParser  = require('body-parser');
const Tokenizer   = require('sentence-tokenizer');
const tokenizer   = new Tokenizer('Chuck');
const exec        = require('child_process').exec;
const fs          = require('fs');
const wordcount = require('wordcount');
//queue
const azure                 = require('azure');
const namespace             = config.queue.namespace;
const namespace_access_key  = config.queue.namespace_access_key;
const serviceBusService     = azure.createServiceBusService('Endpoint=sb://'+ namespace + '.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=' + namespace_access_key);
const totalQueuesCreated    = config.queue.numberOfQueues;




function findRelationships(queueNumber)
{
  let exMessage = [];
  let relations =
    {
      sentence: '',
      instances: [
        {
          quality: '',
          term1: '',
          term2: '',
          relation: ''
        }
      ]
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
        let inputFile = config.ollieAlgo.defaultFileInputPath;
        let fileWrite = fs.createWriteStream(inputFile);
        fileWrite.on('error', function (err) {
          console.log(err);
        });
        tokenizer.setEntry(inputText);
        let allSentences = tokenizer.getSentences();
        for (let sentence in allSentences) {
          fileWrite.write(allSentences[sentence] + '\n');
        }
        fileWrite.end();
        let command = 'java ' + config.ollieAlgo.javaOpt + ' -jar ' + config.ollieAlgo.name + ' ' + inputFile;
        let instancesArr = [];
        exec(command, function (error, stdout) {
          let lines = stdout.toString().replace(/([.?!])\s*(?=[A-Z])/g, '\n').split('\n');
          for (let line in lines) {
            lines[line] = lines[line].replace('\r', '');
            if (lines[line].charAt(0) == '' || lines[line].charAt(0) == ' ')
              continue;
            if (lines[line].charAt(0) != '0') {
              if (line == 0) {
                relations.sentence = lines[line];
              }
              else {
                if (instancesArr.length > 0) {
                  relations.instances = instancesArr;
                  let temp = clone(relations);
                  exMessage.push(temp);
                  relations.sentence = lines[line];
                  instancesArr = [];
                }
                else {
                  relations.sentence = lines[line];
                  instancesArr = [];
                }
              }
            }
            else {
              let re = /\s*:\s*/;
              let list = lines[line].split(re);
              let quali = list[0];
              if(list[1]) {
                list[1] = list[1].replace('(', '');
                list[1] = list[1].replace(')', '');
                re = /\s*;\s*/;
                let terms = list[1].split(re);
                if (quali && terms[0] && terms[1] && terms[2] && wordcount(terms[1]) < config.ollieAlgo.LimitRelationWordCount)
                  instancesArr.push({quality: quali, term1: terms[0], term2: terms[2], relation: terms[1]});
              }
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
                findRelationships(queueNumber);

              }
              else {
                console.log(deleteError);
              }
            });
          });

        });
      }
      else {
        console.log('send data properly');
        queueNumber = (queueNumber + 1);
        if (queueNumber == totalQueuesCreated) {
          queueNumber = 0;
        }
        findRelationships(queueNumber);
      }

    }
    else {
      queueNumber = (queueNumber + 1);
      if (queueNumber == totalQueuesCreated) {
        queueNumber = 0;
      }
      findRelationships(queueNumber);
    }
  });
}
let queueNumber = 0;
findRelationships(queueNumber);
















