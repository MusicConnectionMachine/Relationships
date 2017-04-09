// config.js
module.exports = {
  'server': {
    'host': process.env.COREFERENCE_RESOLUTION_HOST || 'localhost',
    'port': process.env.COREFERENCE_RESOLUTION_PORT || '3005',
  },
  'corefResolution': {
    'name':'CorefResolve',
    'javaOpt':'-Xmx2g -cp',
    'libPath': '\"./stanford-corenlp-full-2016-10-31/*:.\"',
    'libPathwin': '\"./stanford-corenlp-full-2016-10-31/*;:.;\"',
    'defaultFileInputPath': 'example/input.txt',
    'defaultFileOutputPath': 'example/output.txt'
  }
};
