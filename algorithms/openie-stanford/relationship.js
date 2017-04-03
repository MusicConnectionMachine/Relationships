var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
const config = require('./config.json');
const StanfordCoreNLPClient = require('./StanfordCoreNLPClient');

const filter = require("./relationship.filter.js");

const useLocalJson = true;

const client = new StanfordCoreNLPClient(
    undefined,
    'tokenize, ssplit, pos, depparse, relation, openie, coref, ner',
    {
        'openie.resolve_coref': 'true'
    }
);

var data = '';


if (useLocalJson) {
    getFileContent('relationships-testData.json')
        .catch(function (error) {
            console.error(error);
            console.log('error: reading file');
            return;
        }).then(function (data) {
            processNLPResult(JSON.parse(data))
        });
} else {
    getFileContent('mozart.txt')
        .catch(function (error) {
            console.error(error);
            console.log('error: reading file');
            return;
        }).then(function (data) {
            console.log("got data from wet");
            // for wet
            // var contentFirst = splitWet(data);
            // for txt
            var contentFirst = data;
            console.log("Content: " + contentFirst);
            return client.annotate(contentFirst);
        }).catch(function (error) {
            console.error(error);
            console.log('error: coreNLP processing');
            return;
        }).then(function (result) {
            processNLPResult(result);
        });
}

/**
 * @param result json object returned by the NLP server.
 */
function processNLPResult(result) {
    console.log("got data from nlp");

    data = result;

    // log the result
    console.log(JSON.stringify(result));

    // TODO: save everything in DB
    // DB connection missing at the moment

    // TODO: filter data
    var openie = filter.filterOpenIE(result);
    console.log(JSON.stringify(openie));

    var dates = filter.filterDates(result);
    console.log(JSON.stringify(dates));

    // TODO: save filtered data in DB
    // DB connection missing at the moment

    // store output on FS
    saveToFS("openIE", openie);
    saveToFS("dates", dates);
}

function getFileContent(filename) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path.join(__dirname, '/resources') + '/' + filename, 'utf-8', function read(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function splitWet(data) {
    // get websites from wet
    data = data.split("\n\n\n");

    // filter out warc info, TODO: we may need that data later
    // TODO: use more than one website (still testing)
    var content = data[0].split("\n\n")[1];

    // TODO: delete this later, just try to prevent timeout
    content = content.substring(0, 100);

    return content;
}

/**
 * Store the given data as files on local storage, subfolder 'output'.
 * @param filename the name of the file, without extension, will always be .json
 * @param data the json object containing the data
 */
function saveToFS(filename, data) {
    if (!config.save_to_fs) {
        return;
    }
    var dir = path.join(__dirname, '/output');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    fs.writeFile(dir + '/' + filename + ".json", JSON.stringify(data), 'utf-8', function(err) {
        if(err) {
            return console.log(err);
        }

        console.log(filename + " was saved!");
    });
}

/**
 * TODO: implement save to db logic here, maybe just call the API from here.
 */
function saveToDB() {
    if (!config.save_to_db) {
        return;
    }
    // TODO: logic here
}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send(data);
});

module.exports = router;
