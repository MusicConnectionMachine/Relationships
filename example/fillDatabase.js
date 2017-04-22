const utils = require('../app/fileParser');

// FIXME: delete that later, this just populates data from G1 to our DB

function populateDB() {
  console.log('Starting to populate db');

  require('../api/database.js').connect(null, function (context) {
    context.sequelize.sync().then(function () {

      const g2Data = [
        'https://pagestorage.blob.core.windows.net/websites/75e4fad4c7288f8697ff61f2f7f7dfd0',
      ];

      g2Data.forEach(link => {
        dataFromG2(context, link)
      });

      const artists = context.models.artists;
      utils.getFileContent('ArtistsAPI.json').then((data) => {
        //for each file, read  it and do bulk create
        artists.bulkCreate(JSON.parse(data))
          .then(function () {
            console.log('Created artist entries for ArtistsAPI');
          }).catch(function (error) {
            console.log('error: ' + error);
          });
      });

      const works = context.models.works;
      utils.getFileContent('WorksAPI.json').then((data) => {
        //for each file, read  it and do bulk create
        works.bulkCreate(JSON.parse(data))
          .then(function () {
            console.log('Created work entries for WorksAPI');
          }).catch(function (error) {
            console.log('error: ' + error);
          });
      });

      const releases = context.models.releases;
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
      console.error('There was an error while synchronizing the tables between the application and the database.');
      console.error(error);
      process.exit(2);
    });
  });
}

populateDB();

function dataFromG2(context, link) {
  context.models.entities.create({}).then(e => {
    context.models.websites.create({blob_url: link}).then(w => {
      context.models.contains.create({}).then(c => {
        c.setWebsite(w);
        c.setEntity(e);
      });
    });
  });
}
