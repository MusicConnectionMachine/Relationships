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
          if (relation.term1) {
            return relationshipEntities.create({
              'name': relation.term1
            });
          }
        }).catch(err => {
          console.err('ERROR: ' + err);
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
        }).catch(err => {
          console.err('ERROR: ' + err);
        }).then(d => {
          if (d) {
            object = d;
          }
          return relationships.sync();
        }).catch(err => {
          console.err('ERROR: ' + err);
        }).then(() => {
          stem = stemmer.getStemming(relation.relation);
          return relationshipDescriptions.findOne({
            where: {
              relationship_name: stem
            }
          })
        }).catch(err => {
          console.err('ERROR: ' + err);
        }).then(relationshipDescription => {
          if (!relationshipDescription) {
            return relationshipDescriptions.create({
              'relationship_name': stem,
            })
          }
          return relationshipDescription;
        }).catch(err => {
          console.err('ERROR: ' + err);
        }).then(d => {
          relationshipDescription = d;
          return relationships.create({
            'confidence': relation.quality,
            'relation': relation.relation
          });
        }).catch(err => {
          console.err('ERROR: ' + err);
        }).then(relationship => {
          return Promise.all([
            relationship.setSubject(subject),
            relationship.setObject(object),
            relationship.setRelationshipDescription(relationshipDescription)
            ]);
        });
      }));
    }, []);

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
