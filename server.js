'use strict';

var connect = require('connect'),
  path = require('path'),
  passport = require('passport'),
  User = require('./user'),
  ExampleStrategy = require('./passport-example/strategy').Strategy,
  app = connect(),
  server, port = process.argv[2] || 3002,
  oauthConfig = require('./oauth-config'),
  pConf = oauthConfig.provider,
  lConf = oauthConfig.consumer,
  opts = require('./oauth-consumer-config');

if (!connect.router) {
  connect.router = require('connect_router');
}

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
  callbackURL: lConf.protocol + "://" + lConf.host + "/auth/example-oauth2orize/callback"
}, function(accessToken, refreshToken, profile, done) {
  User.findOrCreate({ profile: profile }, function(err, user) {
    user.accessToken = accessToken;
    return done(err, user);
  });
}));

function route(rest) {
  rest.get('/', function(req, res) {
    res.render('index.jade')
  })

  rest.get('/externalapi/account', function(req, res, next) {
    console.log('[using accessToken]', req.user.accessToken);

    if (false) { next(); }
    var request = require('request'),
      options = {
        url: pConf.protocol + '://' + pConf.host + '/api/exampleauth/me',
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


  rest.get('/auth/example-oauth2orize', passport.authenticate('exampleauth', { scope: ['edit-routers', 'edit-chutes'] }));
  rest.get('/auth/example-oauth2orize/callback', passport.authenticate('exampleauth', { failureRedirect: '/close.html?error=foo' }));

  rest.get('/auth/example-oauth2orize/callback', function(req, res) {
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

  rest.post('/auth/example-oauth2orize/callback', function(req, res /*, next*/ ) {
    console.log('req.user', req.user);
    res.end('thanks for playing');
  });
}

app.use(connect.query())
  .use(connect.json())
  .use(connect.urlencoded())
  .use(connect.compress())
  .use(connect.cookieParser())
  .use(connect.session({ secret: 'keyboard mouse' }))
  .use(passport.initialize())
  .use(passport.session())
  .use(connect.router(route))
  .use(connect.static(path.join(__dirname, 'public')));

module.exports = app;

if (require.main === module) {
  server = app.listen(port, function() {
    console.log('Listening on', server.address());
  });
}
