'use strict';

var connect = require('connect'),
  passport = require('passport'),
  express = require('express'),
  request = require('request'),
  conf = require('./config'),
  path = require('path'),
  OAuth2Strategy = require('passport-oauth').OAuth2Strategy;


// Setup the app
var app = express()
  .use(connect.query())
  .use(connect.json())
  .use(connect.urlencoded())
  .use(connect.compress())
  .use(connect.cookieParser())
  .use(connect.session({ secret: 'keyboard mouse' }))
  .use(passport.initialize())
  .use(passport.session())


// Serializing a user object into the session
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  var user = obj;
  done(null, user);
});

passport.use('exampleauth', new OAuth2Strategy({
  clientID: conf.consumer.clientId,
  clientSecret: conf.consumer.clientSecret,
  authorizationURL: conf.provider.url + conf.provider.authorization_route,
  tokenURL: conf.provider.url + conf.provider.token_route,
  callbackURL: conf.consumer.url + "/auth/example-oauth2orize/callback"
}, function(accessToken, refreshToken, profile, done) {
  done(null, { accessToken: accessToken });
}));

// Routing
app.get('/', function(req, res, next) {
  res.sendFile(path.resolve('public/index.html'));
});

app.get('/externalapi/account', function(req, res, next) {
  console.log("Issuing request with token: ", req.user.accessToken)
  request({
    url: conf.provider.url + '/api/routers',
    headers: { 'Authorization': 'Bearer ' + req.user.accessToken, 'X-pd-extension': 'extension' }
  }, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      res.end(body);
    } else {
      res.end('error: \n' + body);
    }
  });
});

app.get('/auth/example-oauth2orize', passport.authenticate('exampleauth', { scope: ['list-routers'] }));
app.get('/auth/example-oauth2orize/callback', passport.authenticate('exampleauth', { failureRedirect: '/close.html?error=foo' }));

app.get('/auth/example-oauth2orize/callback', function(req, res) {
  res.sendFile(path.resolve('public/success.html'));
});

// app.post('/auth/example-oauth2orize/callback', function(req, res /*, next*/ ) {
//   console.log("Moved to passport?")
//   console.log('req.user', req.user);
//   res.end('thanks for playing');
// });

// Server Setup
// Retrieve the port from the configuration URL. Not clean, but this is not meant for production
var split = conf.consumer.url.split(':')
var port = split[split.length - 1]

console.log("Demo consumer running at: ", conf.consumer.url);
app.listen(port);
