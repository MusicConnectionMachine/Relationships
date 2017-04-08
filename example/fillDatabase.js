const utils = require('../app/utils.js');

// FIXME: delete that later, this just populates data from G1 to our DB

function populateDB() {
  console.log('Starting to populate db');

  require('../api/database.js').connect(null, function (context) {
    context.sequelize.sync({force: true}).then(function () {

      const g2Data = [
        'https://wetstorage.blob.core.windows.net/websites/259f9f0a979487bfadebfee1d499f59d',
        'https://wetstorage.blob.core.windows.net/websites/65942867ce39f158cb467020748e62b1',
        'https://wetstorage.blob.core.windows.net/websites/193cf42880d706ec76cdace406ccdfde',
        'https://wetstorage.blob.core.windows.net/websites/10517ebd08dac0defa6db91bf0a13108',
        'https://wetstorage.blob.core.windows.net/websites/204d72a63ec0472efa442e2d8f41cd77',
        'https://wetstorage.blob.core.windows.net/websites/1eabe84416a1388c6dbb2f337edfab62',
        'https://wetstorage.blob.core.windows.net/websites/45a0dfbee627323d3116450128972694',
        'https://wetstorage.blob.core.windows.net/websites/34f59b3e35c7664bf5876532cad37fb5',
        'https://wetstorage.blob.core.windows.net/websites/ae430b9ef4d851657dc0bdb354eef1ba',
        'https://wetstorage.blob.core.windows.net/websites/7103f6271b22e8a2254b0beca7802f9b',
        'https://wetstorage.blob.core.windows.net/websites/c265b5dab52517ef423169817cf8310b'
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
