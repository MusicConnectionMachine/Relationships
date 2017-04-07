'use strict';

const api = require('../api/database.js');
const nlp = require('./wordProcessing.js');

let context = null;

function connect() {
  return new Promise(function (resolve) {
    if (!context) {
      api.connect(null, (localContext) => {
        context = localContext;
        resolve(context);
      });
    } else {
      resolve(context);
    }
  });

}

module.exports.getAllEntities = function() {
  connect().then(() => {
    let entities = context.component('models').module('entities');
    return entities.findAll();
  }).catch(function() {
    console.log('Promise Rejected');
  });
};

module.exports.getAllRelationships = function() {
  connect().then(() => {
    let relationships = context.component('models').module('relationships');
    return relationships.findAll();
  }).catch(function() {
    console.log('Promise Rejected');
  });
};

module.exports.writeRelationships = function (relationJSON) {
  connect().then(() => {
    let relationships = context.component('models').module('relationships');
    let relationshipEntities = context.component('models').module('relationshipEntities');
    let relationshipDescriptions = context.component('models').module('relationshipDescriptions');

    const promises = relationJSON.reduce((acc, sentence) => {
      return acc.concat(sentence.instances.map((relation) => {
        let subject = null;
        let object = null;
        let description = null;
        return relationshipEntities.sync().then(() => {
          // create subject
          if (relation.term1) {
            return relationshipEntities.create({
              'name': relation.term1
            });
          }
        }).then(data => {
          // remember subject
          subject = data;
          // create object
          if (relation.term2) {
            return relationshipEntities.create({
              'name': relation.term2
            });
          }
        }).then(data => {
          // remember object
          object = data;
          // create table in case it doesn't exist yet; TODO: move to global initialization
          return relationships.sync();
        }).then(() => {
          // filter description words
          return nlp.filterMeaningfulVerb(relation.relation)
        }).then(verbs => {
          // stem description words
          verbs = nlp.stem(verbs);
          // create description
          return relationshipDescriptions.findOrCreate({
            where: {
              relationship_name: nlp.array2String(verbs)
            }
          });
        }).spread(data => {
          // remember description
          description = data;
          // create relationship
          return relationships.create({
            'confidence': relation.quality,
            'relation': relation.relation
          });
        }).then(relationship => {
          // set foreign keys (remembered variables) for relationship: all have to be completed
          return Promise.all([
            relationship.setSubject(subject),
            relationship.setObject(object),
            relationship.setRelationshipDescription(description)
          ]);
        }).catch(error => {
          console.error('ERROR: ' + error)
        });
      }));
    }, []);
    Promise.all(promises).then(() => {
      // all relationships added
      console.log('finished :)');
    });
  });
};

module.exports.writeEvents = function (eventJSON) {
  connect().then(() => {
    let events = context.component('models').module('events');

    eventJSON.forEach((event) => {
      events.sync().then(() => {
        events.create({
          'start': event.start,
          'end': event.end,
          'description': event.event
        });
      });
    });
  });
};
