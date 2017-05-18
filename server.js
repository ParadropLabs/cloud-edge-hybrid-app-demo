'use strict';

var path = require('path'),
  passport = require('passport'),
  User = require('./user'),
  ExampleStrategy = require('./passport-example/strategy').Strategy,
  oauthConfig = require('./oauth-config'),
  express = require('express'),
  opts = require('./oauth-consumer-config');

var app = express();
var server, port = process.argv[2] || 3002;

// Passport Functions
passport.serializeUser(function(user, done) {
  //Users.create(user);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  var user = obj;
  done(null, user);
});

passport.use(new ExampleStrategy({
  clientID: opts.clientId,
  clientSecret: opts.clientSecret,
  callbackURL: oauthConfig.consumer.protocol + "://" + oauthConfig.consumer.host + "/auth/example-oauth2orize/callback"
}, function(accessToken, refreshToken, profile, done) {
  User.findOrCreate({ profile: profile }, function(err, user) {
    user.accessToken = accessToken;
    return done(err, user);
  });
}));

// Routing
// function route(rest) {
app.get('/', function(req, res, next) {
  // console.log(res)
  res.render('index.jade');
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
  var url = '/success.html' // + '?type=fb'
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
  console.log('req.user', req.user);
  res.end('thanks for playing');
});
// }


app.use(connect.query())
  .use(connect.json())
  .use(connect.urlencoded())
  .use(connect.compress())
  .use(connect.cookieParser())
  .use(connect.session({ secret: 'keyboard mouse' }))
  .use(passport.initialize())
  .use(passport.session())
  // .use(connect.router(route))
  .use(connect.static(path.join(__dirname, 'public')));

module.exports = app;

if (require.main === module) {
  server = app.listen(port, function() {
    console.log('Listening on', server.address());
  });
}
