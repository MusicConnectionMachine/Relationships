// config.js
module.exports = {
  'server':{
    'port': process.env.DATE_EXTRACTION_PORT || '3003',
    'host':  process.env.DATE_EXTRACTION_HOST || 'localhost'
  },
};
