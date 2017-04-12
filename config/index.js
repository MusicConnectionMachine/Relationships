// config.js
module.exports = {
  'server': {
    'port': '8080',
    'host': 'localhost'
  },
  'db': {
    'host': null,
  },
  // when should we split our website into two or more?
  'splitSize' : 20000,
  'algorithms': {
    'semilar': {
      'call': false,
      'host': process.env.SEMILAR_HOST || '40.69.41.190', //TODO change to correct IP (VM was deleted)
      'port': process.env.SEMILAR_PORT || '80',
      'path': 'SemilarREST/rest/semilar',
      'timeout': 10000
    }
  }
};
