const rq = require('request-promise');
const config = require('./config.json');

class StanfordCoreNLPClient {
    constructor(host = config.core_nlp_server_url, annotators = 'tokenize,ssplit,pos', additionalProps = {}) {
        this.host = host;
        this.properties =
            '?properties={' +
            additionalProps ? JSON.stringify(additionalProps).slice(1, -1) : '' + ', ' +
            '"annotators": "' + annotators + '", ' +
            '"outputFormat": "json"}';
    }

    annotate(text) {
        return rq({
                method:'POST',
                uri: this.host+'/' + this.properties,
                body: text
            }).then(data =>
                JSON.parse(data)
            );

    }
}

module.exports = StanfordCoreNLPClient;