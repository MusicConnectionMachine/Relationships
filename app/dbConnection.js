'use strict';

const api = require('../api/database.js');
const stemmer = require('./stemmer.js');

let context = null;

function connect() {
  return new Promise(function(resolve) {
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
  });
};

module.exports.writeRelationships = function(relationJSON) {
  connect().then(() => {
    let relationships = context.component('models').module('relationships');
    let relationshipEntities = context.component('models').module('relationshipEntities');
    let relationshipDescriptions = context.component('models').module('relationshipDescriptions');

    relationJSON.forEach((sentence) => {
      sentence.instances.forEach((relation) => {
        let subject = null;
        let object = null;
        let relationshipDescription = null;
        let stem = null;
        relationshipEntities.sync().then(() => {
          if (relation.term1) {
            return relationshipEntities.create({
              'name': relation.term1
            });
          }
        }).then(d => {
          if (d) {
            subject = d;
          }
          console.log(d);
          if (relation.term2) {
            return relationshipEntities.create({
              'name': relation.term2
            });
          }
        }).then(d => {
          if (d) {
            object = d;
          }
          return relationships.sync();
        }).then(() => {
          stem = stemmer.getStemming(relation.relation);
          return relationshipDescriptions.findOne({
            where: {
              relationship_name: stem
            }
          })
        }).then(relationshipDescription => {
          if(!relationshipDescription){
            return relationshipDescriptions.create({
              'relationship_name': stem,
            })
          }
          return relationshipDescription;
        }).then(d => {
          relationshipDescription = d;
          return relationships.create({
            'confidence': relation.quality,
            'relation': relation.relation
          });

        }).then(relationship => {
          relationship.setSubject(subject);
          relationship.setObject(object);
          relationship.setRelationshipDescription(relationshipDescription);
        });
      });
    });

  });
};

module.exports.writeEvents = function(eventJSON) {
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
