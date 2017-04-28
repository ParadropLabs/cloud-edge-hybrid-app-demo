'use strict';

var util = require('util'),
  OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
  InternalOAuthError = require('passport-oauth').InternalOAuthError,
  pConf = require('./oauth-config');

function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = pConf.protocol + '://' + pConf.host + '/dialog/authorize';
  options.tokenURL = pConf.protocol + '://' + pConf.host + '/token';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'example-oauth2orize';
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get(pConf.protocol + '://' + pConf.host + '/api/userinfo', accessToken, function(err, body /*, res*/ ) {
    if (err) {
      return done(new InternalOAuthError('failed to fetch user profile', err));
    }

    try {
      var json = JSON.parse(body),
        profile = { provider: 'example-oauth2orize' };

      console.log(json);
      profile._json = json;

      done(null, profile);
    } catch (e) {
      done(e);
    }
  });
};

module.exports.Strategy = Strategy;
