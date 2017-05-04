'use strict';
const api            = require('../../api/database.js');
const cliconfig      = require('../cli/config.js');
const nlp            = require('../classification');

let context = null;

function connect() {
  return new Promise(function (resolve) {
    if (!context) {
      api.connect(cliconfig.dbUri, (localContext) => {
        context = localContext;
        resolve(context);
      });
    } else {
      resolve(context);
    }
  });
}

exports.getAllEntities = function() {
  connect().then(() => {
    let entities = context.models.entities;
    return entities.findAll();
  }).catch(function() {
    console.log('Promise Rejected');
  });
};

exports.getAllRelationships = function() {
  connect().then(() => {
    let relationships = context.models.relationships;
    return relationships.findAll();
  }).catch(function () {
    console.log('Promise Rejected');
  });
};

exports.getWebsitesToEntities = function () {
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

exports.getPromisingWebsites = function () {
  return new Promise((resolve, reject) => {
    connect().then(() => {
      let sortedWebsites = [];

      console.log('Query the db');
      // TODO: remove the limit
      context.sequelize.query(
        'SELECT * from (SELECT blob_url, COUNT(*) as count FROM (select * from websites limit 100000 ) w LEFT JOIN contains c ON w.id = c."websiteId" GROUP BY blob_url ORDER BY count DESC) a where a.count > 5;',
        { type: context.sequelize.QueryTypes.SELECT}
      ).then(promisingWebsites => {
        console.log('Query the db finished: Wet-File Count: ' + promisingWebsites.length);
        sortedWebsites = promisingWebsites.map(website => website.blob_url);
        resolve(sortedWebsites);
      }).catch(error => {
        console.error(error);
        reject(error);
      });
    });
  });
};

exports.writeDefaultRelationshipTypesAndDescriptions = function(defaults) {
  return connect().then(() => {
    let relationshipTypes = context.models.relationshipTypes;
    let relationshipDescriptions = context.models.relationshipDescriptions;

    let typePromises = Object.keys(defaults).map((type) => {
      // create each type
      return relationshipTypes.findOrCreate({
        where: {
          relationship_type: type
        },
        defaults: {
          relationship_type: type
        }
      }).then(typeEntry => {
        let descriptionPromises = defaults[type].map(description => {
          // create each description for type
          return relationshipDescriptions.findOrCreate({
            where: {
              relationship_name: description
            },
            defaults: {
              relationship_name: description
            }
          }).then(descriptionEntry => {
            // connect description to type
            return descriptionEntry[0].setRelationshipType(typeEntry[0]);
          });
        });
        return Promise.all(descriptionPromises).then(() => {
          // all descriptions for this type added
          console.log('Writing default relationship descriptions for type "'+ type +'" in DB: Finished');
        });
      });
    });
    return Promise.all(typePromises).then(() => {
      // all types added
      console.log('Writing default relationship types & descriptions in DB: Finished');
    }).catch(error => {
      console.error('ERROR: ' + error)
    });
  });
};

exports.writeRelationships = function (relationJSON) {
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
              defaults: {
                name: relation.term1
              }
            });
          } else {
            return null;
          }
        }).spread((data, created) => {
          // remember subject
          subject = data;

          if (created) {
            // only link if the relationshipEntity is newly created, do not change existing ones
            linkEntity(subject);
          }

          // create object
          if (relation.term2) {
            return relationshipEntities.findOrCreate({
              where: {
                name: relation.term2
              },
              defaults: {
                name: relation.term2
              }
            });
          } else {
            return null;
          }
        }).spread((data, created) => {
          // remember object
          object = data;

          if (created) {
            // only link if the relationshipEntity is newly created, do not change existing ones
            linkEntity(object);
          }

          // filter description words
          return nlp.filterMeaningfulVerb(relation.relation);
        }).then(verbs => {
          // create description
          //console.log('verbs', verbs);
          return relationshipDescriptions.findOrCreate({
            where: {
              relationship_name: verbs.join(' ')
            },
            defaults: {
              relationship_name: verbs.join(' ')
            }
          });
        }).spread(data => {
          // remember description
          description = data;
          console.log('description', data);
          let relType = nlp.getSemilarType(description.relationship_name);
          if(relType.type)
          {
            return relationshipTypes.findOne({
              where: {
                relationship_type: relType.type
              }
            });
          }
          else
          {
            return relationshipTypes.create({
                relationship_type: relType.type
            });
          }
        }).then(data => {
          type = data;
          console.log('typ:'+data);
          // create relationship
          return relationships.create({
            'confidence': relation.quality,
            'relation': relation.relation
          });
        }).then(relationship => {
          // set foreign keys (remembered variables) for relationship: all have to be completed
          console.log('Writing relationships in DB: act Finished');

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

/**
 * Try to link a relationship entity with the corresponding real entity.
 *
 * Order:
 * - Arists
 * - Works
 * - Instruments
 *
 * @param relEntity relationship entity object from sequelize
 */
function linkEntity (relEntity) {
  // try to find something like this in the other tables
  let artists = context.models.artists;
  let works = context.models.works;
  let instruments = context.models.instruments;
  Promise.all([
    // try artists
    artists.findAll({
      where: {
        name: relEntity.name
      }
    }),
    // try works
    works.findAll({
     where: {
       title: relEntity.name
     }
    }),
    // try instruments
    instruments.findAll({
      where: {
        name: relEntity.name
      }
    })
  ]).then(data => {
    let foundArtists = data[0];
    let foundWorks = data[1];
    let foundInstruments = data[2];
    if (foundArtists.length === 1) {
      // one artist found, link it
      foundArtists[0].getEntity().then(dbEntity => {
        relEntity.setEntity(dbEntity);
      });
    } else if (foundArtists.length > 1) {
      // more artists found, better not link
    } else if (foundWorks.length === 1) {
      // no artist found, but a work
      foundWorks[0].getEntity().then(dbEntity => {
        relEntity.setEntity(dbEntity);
      });
    } else if (foundWorks.length > 1) {
      // more works found, better not link
    } else if (foundInstruments.length === 1) {
      // no artists and no works found, but one instrument
      foundInstruments[0].getEntity().then(dbEntity => {
        relEntity.setEntity(dbEntity);
      });
    } else if (foundInstruments.length > 1) {
      // more instruments found, better not link
    } else {
      // we found nothing, no linking at all
    }
  });
}

exports.writeEvents = function (eventEntityJSON) {
  connect().then(() => {
    let events = context.models.events;
    /**
     * this entity can now be compared with already available entities to store the date event result against them
     * Also may be this entity needs a parsing(like removal of unnecessary characters, but that will depend upon after seeing the
     * entities stored in db
     */
    let entityName = eventEntityJSON.entity;
    let artists = context.models.artists;
    let entities = context.models.entities;
    let eventJSON = eventEntityJSON.content;
    return artists.find({
      where: {
        name: entityName,
      }
    }).then(artist => {
      return artist.getEntity().then((artistEntity)=> {
        if(!artistEntity) {
          return entities.create({
              'name': entityName,
              'artist_type': 'Composer'
            }).then(newEntity => {
              return artist.setEntity(newEntity).then(() => newEntity);
            });
        } else {
          // if the artist wasn't created, we should be able to just the get the existing corresponding entity.
          return artistEntity;
        }
      })
    }).then((entityTableEntry) => {
      /* get the entity from the entity info*/

      const promises = [];

      eventJSON.forEach((event) => {
        const p = events.create({
          'start': event.start,
          'end': event.end,
          'description': event.event
        }).then(event => {
          event.setEntity(entityTableEntry.id);
        });

        promises.push(p);
      });
    });
  });
};

