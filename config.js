'use strict';

module.exports = {
  provider: {
    url: "http://localhost:3000",
    authorization_route: "/auth/oauth/dialog/authorize",
    token_route: "/auth/oauth/token"
  },
  consumer: {
    url: "http://localhost:3004",
    name: 'Samplr',
    icon: 'http://example.com/icon_64.png',
    clientId: 'alpha',
    clientSecret: 'beta'
  },
};
