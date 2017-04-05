'use strict';

const api = require('../api/database.js');
const stemmer = require('./stemmer.js');

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

module.exports.getAllEntities = function () {
  connect().then(() => {
    let entities = context.component('models').module('entities');
    return entities.findAll();
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
        let relationshipDescription = null;
        let stem = null;
        return relationshipEntities.sync().then(() => {
          // create subject
          if (relation.term1) {
            return relationshipEntities.create({
              'name': relation.term1
            });
          }
        }).then(d => {
          // remember subject
          subject = d;
          // create object
          if (relation.term2) {
            return relationshipEntities.create({
              'name': relation.term2
            });
          }
        }).then(d => {
          // remember object
          object = d;
          // create table in case it doesn't exist yet; TODO: move to global initialization
          return relationships.sync();
        }).then(() => {
          // create & stem description
          stem = stemmer.getStemming(relation.relation);
          return relationshipDescriptions.findOrCreate({
            where: {
              relationship_name: stem
            }
          });
        }).spread(d => {
          // remember description
          relationshipDescription = d;
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
            relationship.setRelationshipDescription(relationshipDescription)
          ]);
        }).catch(err => {
          console.error('ERROR: ' + err)
        });
      }));
    }, []);
    // relationship added
    Promise.all(promises).then(() => {
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
