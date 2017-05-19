'use strict';

module.exports = {
  provider: {
    url: "http://localhost:3000/auth/oauth",
  },
  consumer: {
    url: "http://localhost:3002",
    name: 'Samplr',
    icon: 'http://example.com/icon_64.png',
    clientId: 'alpha',
    clientSecret: 'beta'
  },
};
