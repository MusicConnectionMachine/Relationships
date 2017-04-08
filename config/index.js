// config.js
module.exports = {
  'server': {
    'port': '8080',
    'host': 'localhost'
  },
  'db': {
    'host': 'localhost',
    'port': '5432'
  },
  'volume': {
    'input': '',
    'output': ''
  },
  'algorithms': {
    'ollie': {
      'call': true,
      'host': process.env.OLLIE_HOST || '40.69.64.78',
      'port': process.env.OLLIE_PORT || '80',
      'path': 'relationship/Ollie/extractRelationships',
      'timeout': 120000
    },
    'openie_washington': {
      'call': false,
      'host': process.env.OPENIE_WASHINGTON_HOST || 'localhost',
      'port': process.env.OPENIE_WASHINGTON_PORT || '3001',
      'path': 'relationship/openie_washington/extractRelationships',
      'timeout': 10000
    },
    'openie_stanford': {
      'call': false,
      'host': process.env.OPENIE_STANFORD_HOST || 'localhost',
      'port': process.env.OPENIE_STANFORD_PORT || '3002',
      'path': 'openie_stanford/getRelationships',
      'timeout': 10000
    },
    'date_event_extraction': {
      'call': true,
      'host': process.env.DATE_EXTRACTION_HOST || '40.69.44.71',
      'port': process.env.DATE_EXTRACTION_PORT || '80',
      'path': 'date_event_extraction/getdateevents',
      'timeout': 10000
    },
    'exemplar': {
      'call': false,
      'host': process.env.EXEMPLAR_HOST || 'localhost',
      'port': process.env.EXEMPLAR_PORT || '3004',
      'path': 'relationship/exemplar/extractRelationships',
      'timeout': 10000
    },
    'coreference_resolution': {
      'call': true,
      'host': process.env.COREFERENCE_RESOLUTION_HOST || '13.79.163.28',
      'port': process.env.COREFERENCE_RESOLUTION_PORT || '80',
      'path': 'relationship/coref/corefResolution',
      'timeout': 120000
    }
  }
};
