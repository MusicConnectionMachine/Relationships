// config.js
module.exports = {
  'server': {
    'port': '3005',
    'host': 'localhost'
  },
  'corefResolution': {
    'name':'CorefResolve',
    'javaOpt':'-mx5g -cp',
    'libPath': "\"./stanford-corenlp-full-2016-10-31/*:.\"",
    'libPathwin': "\"./stanford-corenlp-full-2016-10-31/*;:.;\"",
    'defaultFilePath': 'example/test.txt',
    'defaultFileInputPath': 'example/input.txt',
    'defaultFileOutputPath': 'example/temp_output.txt'
  }
};
