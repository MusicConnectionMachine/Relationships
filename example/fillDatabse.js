const utils = require('../app/utils.js');

// FIXME: delete that later, this just populates data from G1 to our DB

function populateDB() {
  console.log('Starting to populate db');

  require('../api/database.js').connect(null, function (context) {
    context.sequelize.sync({force: true}).then(function () {

      const artists = context.component('models').module('artists');
      utils.getFileContent('ArtistsAPI.json').then((data) => {
        //for each file, read  it and do bulk create
        artists.bulkCreate(JSON.parse(data))
          .then(function () {
            console.log('Created artist entries for ArtistsAPI');
          }).catch(function (error) {
            console.log('error: ' + error);
          });
      });

      const works = context.component('models').module('works');
      utils.getFileContent('WorksAPI.json').then((data) => {
        //for each file, read  it and do bulk create
        works.bulkCreate(JSON.parse(data))
          .then(function () {
            console.log('Created work entries for WorksAPI');
          }).catch(function (error) {
            console.log('error: ' + error);
          });
      });

      const releases = context.component('models').module('releases');
      utils.getFileContent('ReleasesAPI.json').then((data) => {
        //for each file, read  it and do bulk create
        releases.bulkCreate(JSON.parse(data))
          .then(function () {
            console.log('Created release entries for ReleasesAPI');
          }).catch(function (error) {
            console.log('error: ' + error);
          });
      });
    }).catch(function (error) {
      console.error('There was an error while syncronizing the tables between the application and the database.');
      console.error(error);
      process.exit(2);
    });
  });
}

populateDB();
