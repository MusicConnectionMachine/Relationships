const utils = require('../app/utils.js');

// FIXME: delete that later, this just populates data from G1 to our DB

function populateDB() {
  console.log('Starting to populate db');

  require('../api/database.js').connect(null, function (context) {
    context.sequelize.sync({force: true}).then(function () {

      const g2Data = [
        'https://wetstorage.blob.core.windows.net/websites/bc0e327892605b340da371c703fc1b4a',
        'https://wetstorage.blob.core.windows.net/websites/c54dc541755aebe8698b7968468f0652',
        'https://wetstorage.blob.core.windows.net/websites/966c8b5c5ecfc1ad901db21387d25791',
        'https://wetstorage.blob.core.windows.net/websites/5b0068a04ea312290075c2e4755fe874',
        'https://wetstorage.blob.core.windows.net/websites/db70e7df5bbc7173eed4d78af2c3ef97',
        'https://wetstorage.blob.core.windows.net/websites/ef7e9317d6c1dcf9d58b054871b11014',
        'https://wetstorage.blob.core.windows.net/websites/00a8247d9b2898919e00a0ad42250e4d',
        'https://wetstorage.blob.core.windows.net/websites/6b340f30637e60137814d86ec220fd26',
        'https://wetstorage.blob.core.windows.net/websites/776071d727554b89c9e605b888689cdc',
        'https://wetstorage.blob.core.windows.net/websites/1f64270fb6297afc38f7970e2bf1cf72',
        'https://wetstorage.blob.core.windows.net/websites/dc14c5daa446020b821546ed48e3af2b',
        'https://wetstorage.blob.core.windows.net/websites/52cd2c827b0807a6e74bdfac871bcaca',
        'https://wetstorage.blob.core.windows.net/websites/9b8abcfc6d1590e8dc23fcfabae9ecb1',
        'https://wetstorage.blob.core.windows.net/websites/64c2e0f9f4e49db4826bd8f0f05f5677',
        'https://wetstorage.blob.core.windows.net/websites/e825daf46abbfa8cbbf6bb3239ba4d8c',
        'https://wetstorage.blob.core.windows.net/websites/e9e60effcc4a32fb0a50efb7160c337e',
        'https://wetstorage.blob.core.windows.net/websites/af45d557465efec5c227c7afd471d432',
        'https://wetstorage.blob.core.windows.net/websites/d9f0dd6a4665f8b2b121b1d4d5b8f582',
        'https://wetstorage.blob.core.windows.net/websites/768e58661f4b2ddfe66362f2bc27dd19',
        'https://wetstorage.blob.core.windows.net/websites/9cd68e461a9a022ffe3328693f6caf95',
        'https://wetstorage.blob.core.windows.net/websites/821d05f0c3a9bb85c8dd9e143ea2dd27',
        'https://wetstorage.blob.core.windows.net/websites/132f629b1d24df832fc107906c6b1b7c',
        'https://wetstorage.blob.core.windows.net/websites/329804c8fd9e5a73fb6393bd44ca239c',
        'https://wetstorage.blob.core.windows.net/websites/5431e2618ff42881e1038533d62786e4'
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
