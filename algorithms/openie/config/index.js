// config.js
module.exports = {
  "server":{
    "port": "3001",
    "host": "localhost"
  },
  "openieAlgo": {
    "name":"openie-assembly-4.2.2-SNAPSHOT.jar",
    "javaOpt":"-Xmx4g -XX:+UseConcMarkSweepGC",
    "format": "--format column",
    "defaultFilePath": "example/test.txt",
    "defaultFileSavePath": "example/input.txt"
  }
};
