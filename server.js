'use strict';

var connect = require('connect'),
  path = require('path'),
  passport = require('passport'),
  User = require('./user'),
  ExampleStrategy = require('./passport-sample').Strategy,
  OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
  oauthConfig = require('./oauth-config'),
  express = require('express'),
  opts = require('./oauth-consumer-config'),
  path = require('path');

var app = express();
var port = process.argv[2] || 3002;

// Passport Functions
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  var user = obj;
  done(null, user);
});

passport.use('exampleauth', new OAuth2Strategy({
  clientID: opts.clientId,
  clientSecret: opts.clientSecret,
  authorizationURL: oauthConfig.provider.protocol + '://' + oauthConfig.provider.host + '/dialog/authorize',
  tokenURL: oauthConfig.provider.protocol + '://' + oauthConfig.provider.host + '/token',
  callbackURL: oauthConfig.consumer.protocol + "://" + oauthConfig.consumer.host + "/auth/example-oauth2orize/callback"
}, function(accessToken, refreshToken, profile, done) {
  console.log("Why do you call the profile callback?");
  done(null, null);
  // User.findOrCreate({ profile: profile }, function(err, user) {
  //   user.accessToken = accessToken;
  //   return done(err, user);
  // });
}));

// Routing
app.get('/', function(req, res, next) {
  res.sendFile(path.resolve('public/index.html'));
});

app.get('/externalapi/account', function(req, res, next) {
  console.log('[using accessToken]', req.user.accessToken);

  if (false) { next(); }
  var request = require('request'),
    options = {
      url: oauthConfig.provider.protocol + '://' + oauthConfig.provider.host + '/api/exampleauth/me',
      headers: {
        'Authorization': 'Bearer ' + req.user.accessToken
      }
    };

  function callback(error, response, body) {
    if (!error && response.statusCode === 200) {
      res.end(body);
    } else {
      res.end('error: \n' + body);
    }
  }

  request(options, callback);
});


app.get('/auth/example-oauth2orize', passport.authenticate('exampleauth', { scope: ['edit-routers', 'edit-chutes'] }));
app.get('/auth/example-oauth2orize/callback', passport.authenticate('exampleauth', { failureRedirect: '/close.html?error=foo' }));

app.get('/auth/example-oauth2orize/callback', function(req, res) {
  console.log('req.session');
  console.log(req.session);
  var url = '/success.html'
    /*
    + '&accessToken=' + req.session.passport.user.accessToken
    + '&email=' + req.session.passport.user.profile.email
    + '&link=' + req.session.passport.user.profile.profileUrl
    */
  ;

  console.log(url);
  res.statusCode = 302;
  res.setHeader('Location', url);
  res.end('hello');
  // This will pass through to the static module
  //req.url = url;
  //next();
});

app.post('/auth/example-oauth2orize/callback', function(req, res /*, next*/ ) {
  console.log("Moved to passport?")
  console.log('req.user', req.user);
  res.end('thanks for playing');
});

// Server Setup
app.use(connect.query())
  .use(connect.json())
  .use(connect.urlencoded())
  .use(connect.compress())
  .use(connect.cookieParser())
  .use(connect.session({ secret: 'keyboard mouse' }))
  .use(passport.initialize())
  .use(passport.session());


var server = app.listen(port, function() {
  console.log('Listening on', server.address());
});
