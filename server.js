'use strict';

var connect = require('connect'),
  passport = require('passport'),
  express = require('express'),
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
  authorizationURL: conf.provider.url + '/dialog/authorize',
  tokenURL: conf.provider.url + '/token',
  callbackURL: conf.consumer.url + "/auth/example-oauth2orize/callback"
}, function(accessToken, refreshToken, profile, done) {
  done(null, { accessToken: accessToken });
}));

// Routing
app.get('/', function(req, res, next) {
  res.sendFile(path.resolve('public/index.html'));
});

app.get('/externalapi/account', function(req, res, next) {
  var request = require('request'),
    options = {
      url: conf.provider.url + '/api/exampleauth/me',
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
  res.sendFile(path.resolve('public/success.html'));
});

app.post('/auth/example-oauth2orize/callback', function(req, res /*, next*/ ) {
  console.log("Moved to passport?")
  console.log('req.user', req.user);
  res.end('thanks for playing');
});

// Server Setup
var port = process.argv[2] || 3002;

var server = app.listen(port, function() {
  console.log('Listening on', server.address());
});
