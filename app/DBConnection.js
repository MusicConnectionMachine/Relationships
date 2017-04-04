'use strict';

const apiLocation = "../api/";
const api = require(apiLocation + "database.js");

var context = null;

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
    var entities = context.component('models').module('entities');
    return entities.findAll();
  });
};

module.exports.writeRelationships = function(relationJSON) {
  connect().then(() => {
    var relationships = context.component('models').module('relationships');
    //var relationshipDescription = context.component('models').module('relationshipDescriptions');
    var relationshipEntities = context.component('models').module('relationshipEntities');
    //var relationshipOccurrences = context.component('models').module('relationshipOccurrences');
    //var relationshipTypes = context.component('models').module('relationshipTypes');

    relationJSON.forEach((sentence) => {
      sentence.instances.forEach((relation) => {
        var subjectId = null;
        var objectId = null;
        //var relationshipId = null;
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
        }).then(d => {
          if (d) {
            //relationshipId = d.id;
          }
        });
      });
    });
    console.log('finished writing in DB');
  });
};

module.exports.writeEvents = function(eventJSON) {
  connect().then(() => {
    var events = context.component('models').module('events');

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
