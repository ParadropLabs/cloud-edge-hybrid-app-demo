'use strict';

module.exports = {
  provider: {
    url: 'https://paradrop.org',

    // Useful for testing against a local instance of the paradrop server
    // url: "http://localhost:3000",

    // These are the routes that the OAuth2 client needs to hit to run its flow.
    // They are defined by the paradrop server @paradrop.org
    authorizationRoute: '/auth/oauth/dialog/authorize',
    tokenRoute: '/auth/oauth/token'
  },
  consumer: {
    url: 'http://localhost:3004',
    name: 'ParaDrop hybrid app demo',
    clientId: '0iOwuc46s1g76zSDvxfJmfNL8GssTMnx',
    clientSecret: 'epKQ1rg3FDaBkOLCbNOxNb5Mr4xd6BlY'
  },
};
