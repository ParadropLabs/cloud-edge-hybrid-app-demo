'use strict';

module.exports = {
  oauth2: {
    url: 'https://paradrop.org',

    // Useful for testing against a local instance of the paradrop server
    // url: "http://localhost:3000",

    // These are the routes that the OAuth2 client needs to hit to run its flow.
    // They are defined by the paradrop server @paradrop.org
    authorizationRoute: '/auth/oauth/dialog/authorize',
    tokenRoute: '/auth/oauth/token',

    // We will need to register the callback url for an application
    // in a future version of the paradrop server
    callbackUrl: 'http://localhost:3004/auth/oauth2/callback'
  },
};
