## Setup

Choose one of the following possibilites:

### Using [Docker](https://www.docker.com)
2. run `docker build -t awesome .`
3. run `docker run -p 3006:3006 -d awesome`
4. go to http://localhost:3006/openie_stanford/getRelationships

### Manually

#### 1. Stanford CoreNLP locally
1. [download the latest Version](http://stanfordnlp.github.io/CoreNLP/#download)
2. run `java -mx4g -cp "*" edu.stanford.nlp.pipeline.StanfordCoreNLPServer` in the extracted folder to start the magic on localhost:9000

#### 2. Express Project
1. cd into this folder (in a new console)
2. in config.json, change the `core_nlp_server_url` to `http://localhost:9000`
3. run `npm install`
4. run `npm run start`
5. go to http://localhost:3006/openie_stanford/getRelationships

For Mac: In case you don't have [wget](https://www.gnu.org/software/wget) installed, you can get it via [homebrew](https://brew.sh) by running `brew install wget`