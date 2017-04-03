# Relationships

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e0dbceb064d44c94b36b56d00449bf19)](https://www.codacy.com/app/ansjin/Relationships?utm_source=github.com&utm_medium=referral&utm_content=MusicConnectionMachine/Relationships&utm_campaign=badger)
[![Gitter](https://badges.gitter.im/MusicConnectionMachine/Relationships.svg)](https://gitter.im/MusicConnectionMachine/Relationships?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/MusicConnectionMachine/Relationships.png?branch=develop)](https://travis-ci.org/MusicConnectionMachine/Relationships)

In this repository we will try to build and determine relationships between composers


## Setup


1. Install the node and npm, from the website (https://nodejs.org/en/download/)
2. Install the docker and docker-compose


### Dockerhub Setup

To Do

## Run Project

#### Local Run: 

To run the project locally follow the following steps:

1. After successfully installing it, go into the project root directory and run 
**npm install**. This will install all the dependencies.
2. Now run the server by running the command **npm start**
3. Now open http://localhost:8080/docs, you will get a welcome message from swagger with all APIs description.
**Note:** 
If you want to check algorithms API, run the npm from the specific algortihms folder and 
go to the specific port as shown in terminal.


#### Run inside Docker:
 
 1. Run the shell script inside the script folder.



#### Relationship Extraction Algorithms
Relationship extraction algorithm will be running in a seprate container and our main application
will interact with it to get the relationship. 

Scripts are added to run the algorithms inside the docker.
 
We are considering **Ollie** and **Open-IE(by Washington univ)** algorithms for relationship extraction.

Node.js wrapper is added for both the algorithms.
Input to the ALgorithms can be provided in either a text file format or Array of strings format.
```
{
   "inputpath":"example/test.txt"
 }
 or 
 {
    "array":["hello i am here", "whats is going on"]
  }
```
The output from the ollie algorithm will be in this format:
```
{
    "sentence": "Educated at the Royal College of Music, he began his career contributing songs to revues and incidental music for the stage, forming a notable partnership with the playwright Clemence Dane.",
    "instances": [
      {
        "quality": "0.857",
        "term1": "Educated",
        "term2": "began",
        "term3": "his career contributing songs to revues and incidental music for the stage"
      },
      {
        "quality": "0.846",
        "term1": "his career",
        "term2": "contributing songs to",
        "term3": "revues and incidental music"
      },
      {
        "quality": "0.761",
        "term1": "he",
        "term2": "began",
        "term3": "his career contributing songs to revues and incidental music for the stage"
      },
      {
        "quality": "0.577",
        "term1": "songs",
        "term2": "be contributing to",
        "term3": "revues and incidental music"
      },
      {
        "quality": "0.528",
        "term1": "Educated",
        "term2": "began his career contributing songs to revues and incidental music for the stage forming",
        "term3": "a notable partnership"
      },
      {
        "quality": "0.373",
        "term1": "he",
        "term2": "began his career contributing songs to revues and incidental music for the stage forming",
        "term3": "a notable partnership"
      }
    ]
  },
  {....}
  ```
The output from the openIE algorithm will be in this format:
  ```

[
  {
    "sentence": "Educated at the Royal College of Music, he began his career contributing songs to revues and incidental music for the stage, forming a notable partnership with the playwright Clemence Dane.",
    "instances": [
      {
        "quality": "0.2560951955542683",
        "term1": "he",
        "term2": "his career",
        "relation": "began"
      },
      {
        "quality": "0.3880890333449538",
        "term1": "he",
        "term2": "to revues and incidental music",
        "relation": "began his career contributing"
      },
      {
        "quality": "0.292827695956731",
        "term1": "he",
        "term2": "a notable partnership with the playwright",
        "relation": "began his career forming"
      }
    ]
  },
  {...}
  ]
   ```
These APIs will be called from the main application.

**Note:**
1. Download/Build the complete JAR of the ollie algorithm and copy it inside the ollie 
  directory inside algorithms folder. https://github.com/knowitall/ollie
  2. Download/Build the complete JAR of the OpenIE algorithm and copy it inside the openie 
       directory inside algorithms folder. https://github.com/knowitall/openie
#### Co-Reference Resolution Algorithms
This algorithm will remove all the co references with their actual references inside the text.
Steps to run the algorithm: 
1. To run this first download the Stanford NLP package from here (http://nlp.stanford.edu/software/stanford-corenlp-full-2016-10-31.zip) and extract in the root directory of the coreference_resolution directory.
2. You can either run inside the docker container(docker-compose up) or locally(npm start) inside the coreference_resolution directory.

#### Date-Event Extraction Algorithm
This algorithm will extract the date and events from the text and gives the output in the below form :
   ```
[
    {
        "start": "1685",
        "event": "Bach was born in Eisenach in 1685."
    },
    {
        "start": "1700",
        "event": "Because of his excellent singing voice, Bach attained a position at the Michaelis monastery at L?neberg in 1700."
    },
    {
        "start": "1703",
        "event": "After taking a short-lived post in Weimar in 1703 as a violinist, Bach became organist at the Neue Kirche in Arnstadt (1703-1707)."
    },
    {
        "start": "June 1707",
        "event": "Blasius in M?hlhausen as organist, beginning in June 1707, and married his cousin, Maria Barbara Bach, that fall."
    },
]
   ```
You can either run inside the docker container(docker-compose up) or locally(npm start) inside the coreference_resolution directory.
## Example to test the server

1. First install postman plugin for chrome browser, this will be used to send json query to our application
2. Choose the post, and enter the URL as any from the following:
```
    1. http://localhost:8080/relationshipg3/getAllSentences
    2. http://localhost:8080/relationshipg3/getAllEntities
    3. http://localhost:8080/relationshipg3/getAllEntitySentences
```
    
3. Use the following structure as the **body** with data as "**raw**" and format as "**JSON**"


```
 {
   "article": "path/to/text.txt file",
   "occurrences":
   [
       {
         "term": "Mozart",
         "role": "composer",
         "positions": [ 10, 42 ]
       },
     {
       "term": "Salzburg",
       "role": "city",
       "positions": [ 90 ]
     }
   ]
 }
```
`Note:`
This is in refernce to structure given by team-2.

Also change the path to the absolute path of the "test.txt" file in the example directory.

4. Then click on the send. In response to that you will get the required result.
