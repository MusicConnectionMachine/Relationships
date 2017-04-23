// config.js
module.exports = {
  // when should we split our website into two or more?
  'splitSize' : 20000,
  'coRefAlgorithms': {
    'parallelRequests' : 1,
    'timeOut' : 120000
  },
  'relAlgorithms': {
    'parallelRequests' : 5,
    'timeOut' : 120000
  },
  'eventAlgorithms': {
    'parallelRequests' : 5,
    'timeOut' : 120000
  },
  'semilar': {
    'parallelRequests' : 5,
    'timeOut' : 120000
  }
};
