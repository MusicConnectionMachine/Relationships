'use strict';

const api = require('../api/database.js');

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

    relationJSON.forEach((sentence) => {
      sentence.instances.forEach((relation) => {
        let subjectId = null;
        let objectId = null;
        relationshipEntities.sync().then(() => {
          if (relation.term1) {
            return relationshipEntities.create({
              'name': relation.term1
            });
          }
        }).then(d => {
          if (d) {
            subjectId = d.id;
          }
          console.log(d);
          if (relation.term2) {
            return relationshipEntities.create({
              'name': relation.term2
            });
          }
        }).then(d => {
          if (d) {
            objectId = d.id;
          }
          return relationships.sync();
        }).then(() => {
          return relationships.create({
            'confidence': relation.quality,
            'subjectId': subjectId,
            'objectId': objectId,
            'relation': relation.relation
          });
        });
      });
    });
    console.log('finished writing in DB');
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
