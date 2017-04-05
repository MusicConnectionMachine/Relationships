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
  'algorithms': [
    {
      'ollie': {
        'host': process.env.OLLIE_HOST || 'localhost',
        'port': process.env.OLLIE_PORT || '3000',
        'path': 'relationship/Ollie/extractRelationships'
      }
    },
    {
      'openie-washington': {
        'host': process.env.OPENIE_WASHINGTON_HOST || 'localhost',
        'port': process.env.OPENIE_WASHINGTON_PORT || '3001'
      }
    },
    {
      'openie-stanford': {
        'host': process.env.OPENIE_STANFORD_HOST || 'localhost',
        'port': process.env.OPENIE_STANFORD_PORT || '3002'
      }
    },
    {
      'date_event_extraction': {
        'host': process.env.DATE_EXTRACTION_HOST || 'localhost',
        'port': process.env.DATE_EXTRACTION_PORT || '3003',
        'path': 'date_event_extraction/getdateevents'
      }
    },
    {
      'exemplar': {
        'host': process.env.EXEMPLAR_HOST || 'localhost',
        'port': process.env.EXEMPLAR_PORT || '3004'
      }
    },
    {
      'coreference_resolution': {
        'host': process.env.COREFERENCE_RESOLUTION_HOST || 'localhost',
        'port': process.env.COREFERENCE_RESOLUTION_PORT || '3005',
        'path': 'relationship/coref/corefResolution'
      }
    }
  ]
};
