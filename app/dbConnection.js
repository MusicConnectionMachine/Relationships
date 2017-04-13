'use strict';

const api = require('../api/database.js');
const config = require('./config');
const util = require('./utils.js');
const nlp = require('./classification');

let context = null;

function connect() {
  return new Promise(function (resolve) {
    if (!context) {
      api.connect(config.dbUri, (localContext) => {
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
    let entities = context.models.entities;
    return entities.findAll();
  }).catch(function() {
    console.log('Promise Rejected');
  });
};

module.exports.getAllRelationships = function() {
  connect().then(() => {
    let relationships = context.models.relationships;
    return relationships.findAll();
  }).catch(function () {
    console.log('Promise Rejected');
  });
};

module.exports.getWebsitesToEntities = function () {
  return new Promise(resolve => {
    connect().then(() => {
      let entities = context.models.entities;
      let contains = context.models.contains;
      let websites = context.models.websites;
      let sortedWebsites = {};

      entities.findAll({
        include: [{
          model : contains,
          include: [websites]
        }]
      }).then(allEntities => {
        allEntities.forEach(entity => {
          if (entity.contain.website.blob_url) {
            if (!sortedWebsites[entity.id]) {
              sortedWebsites[entity.id] = [];
            }
            sortedWebsites[entity.id].push(entity.contain.website.blob_url);
          }
        });
        resolve(sortedWebsites);
      });
    });
  });
};

module.exports.writeDefaultRelationshipTypes = function() {
  const types = Object.keys(config.classificationDescriptions);
  let relationshipTypes = context.models.relationshipTypes;

  connect().then(() => {
    let promises = types.map((type) => {
      return relationshipTypes.create({relationship_type: type});
    });
    return Promise.all(promises).then(() => {
      // all types added
      console.log('Writing relationship types in DB: Finished');
    });
  });
};

module.exports.writeRelationships = function (relationJSON) {
  connect().then(() => {
    let relationships = context.models.relationships;
    let relationshipEntities = context.models.relationshipEntities;
    let relationshipDescriptions = context.models.relationshipDescriptions;
    let relationshipTypes = context.models.relationshipTypes;

    const promises = relationJSON.reduce((acc, sentence) => {
      return acc.concat(sentence.instances.map((relation) => {
        let subject = null;
        let object = null;
        let description = null;
        let type = null;
        return relationshipEntities.sync().then(() => {
          // create subject
          if (relation.term1) {
            return relationshipEntities.findOrCreate({
              where: {
                name: relation.term1
              },
              name: relation.term1
            });
          } else {
            return null;
          }
        }).spread(data => {
          // remember subject
          subject = data;
          // create object
          if (relation.term2) {
            return relationshipEntities.findOrCreate({
              where: {
                name: relation.term2
              },
              name: relation.term2
            });
          } else {
            return null;
          }
        }).spread(data => {
          // remember object
          object = data;
          // create table in case it doesn't exist yet; TODO: move to global initialization
          return relationships.sync();
        }).then(() => {
          // filter description words
          return nlp.filterMeaningfulVerb(relation.relation)
        }).then(verbs => {
          // create description
          return relationshipDescriptions.findOrCreate({
            where: {
              relationship_name: util.array2String(verbs)
            }
          });
        }).spread(data => {
          // remember description
          description = data;

          if (!config.semilarAlgorithm) {
            return null;
          }
          return nlp.getSemilarType(description.relationship_name).then(relType => {
            return relationshipTypes.findOne({
              where: {
                relationship_type: relType.type
              }
            });
          });
        }).then(data => {
          type = data;
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
            relationship.setRelationshipDescription(description),
            description.setRelationshipType(type)
          ]);
        }).catch(error => {
          console.error('ERROR: ' + error)
        });
      }));
    }, []);
    Promise.all(promises).then(() => {
      // all relationships added
      console.log('Writing relationships in DB: Finished');
    });
  });
};

module.exports.writeEvents = function (eventJSON) {
  connect().then(() => {
    let events = context.models.events;

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
