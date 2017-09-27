'use strict';

module.exports = {
  provider: {
    url: "https://paradrop.org",

    // Useful for testing against a local instance of the paradrop server
    // url: "http://localhost:3000",

    // These are the routes that the OAuth client needs to hit to run its flow.
    // You don't need to change them.
    authorization_route: "/auth/oauth/dialog/authorize",
    token_route: "/auth/oauth/token"
  },
  consumer: {
    url: "http://localhost:3004",
    name: 'Demo',
    icon: 'http://example.com/icon_64.png',
    clientId: '',
    clientSecret: ''
  },
};
