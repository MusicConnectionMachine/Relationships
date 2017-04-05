'use strict';


// FIXME: Delete that later, this is just my personal playground for testing.
// FIXME: Only committed it, because some others might use it for testing their s

const utils = require('./app/utils.js');
const wetFileParser = require('./app/wetParser.js');
const dbConnection = require('./app/dbConnection.js');
/*
// test writing event data in DB
utils.getFileContent('output/bachOutput.json').then(data => {
  dbConnection.writeEvents(JSON.parse(data));
});

// test writing relationship data in DB
utils.getFileContent('output/relationships.json').then(data => {
  dbConnection.writeRelationships(JSON.parse(data));
});
*/
// test getting and parsing a wet file from the url
/*wetFileParser.parse('https://github.com/MusicConnectionMachine/UnstructuredData/files/850757/CC-MAIN-20170219104612-00150-ip-10-171-10-108.ec2.internal_filtered.warc.zip')
  .then(allWebsites => {
    let count = 0;
    allWebsites.forEach(website => {
      if (website) {
        utils.callDateEventExtraction(website, (result) => {
          if (result) {
            console.log('Website #' + count++);
            console.log(website);
            if (typeof(result) === 'string') {
              console.log('Result is a String: ' + result);
            } else {
              console.log('Write JSON to DB');
              console.log(result);
              dbConnection.writeEvents(result);
            }
            // console.log('Write: ' + JSON.stringify(result));
          }
        });
      }
    })
  });
*/
const testfile = 'mozart.txt';
console.log('Try to access file: ' + testfile);
utils.getTestFileContent(testfile)
  .then(allWebsites => {
    if (typeof(allWebsites) === 'string') {
      // only got one website
      processWebsite(allWebsites);
    } else if (allWebsites instanceof Array) {
      // multiple websites
      allWebsites.forEach(website => {
        processWebsite(website);
      })
    }
  }, error => {
    console.error(error);
  });

function processWebsite(website) {
  if (website) {
    console.log('Call CoRef');
    utils.callCoReferenceResolution(website)
      .catch((error) => {
        // first catch the error, then work on in then()
        console.error('CoRef: ' + error);
      })
      .then((replacedCorefs) => {
        if (!replacedCorefs) {
          // previous error, or no data from coref, let's just use the website data from before
          replacedCorefs = website;
        }
        console.log('Call DateEventExcraction');
        utils.callDateEventExtraction(replacedCorefs)
          .then(result => {
            if (result) {
              if (typeof(result) === 'string') {
                console.log('DateEventExcraction: Result is a String: ' + result);
              } else {
                // write to db
                console.log('DateEventExcraction: Write JSON to DB');
                dbConnection.writeEvents(result);
              }
            }
          }, error => {
            console.error('DateEventExcraction: ' + error);
          });
        console.log('Call Ollie');
        utils.callOllie(replacedCorefs)
          .then(result => {
            if (result) {
              if (typeof(result) === 'string') {
                console.log('Ollie: Result is a String: ' + result);
              } else {
                // write to db
                console.log('Ollie: Write JSON to DB');
                dbConnection.writeEvents(result);
              }
            }
          }, error => {
            console.error('Ollie: ' + error);
          });
      });
  }
}
