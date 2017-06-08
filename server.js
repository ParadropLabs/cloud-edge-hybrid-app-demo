var connect = require('connect'),
  passport = require('passport'),
  express = require('express'),
  request = require('request'),
  conf = require('./config'),
  handlebars = require('handlebars'),
  exphbs = require('express-handlebars'),
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
  .use(passport.session());

app.engine('html', exphbs({ extname: '.html' }));
app.set('view engine', 'html');

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
app.get('/', function(req, res, next) { res.render('index'); });
app.get('/error', function(req, res, next) { res.render('error'); });
app.get('/template', function(req, res, next) { res.render('templ', { test: "hello!" }) });
app.get('/auth/example-oauth2orize/callback', function(req, res) { res.render('authed'); });

app.get('/auth/example-oauth2orize', passport.authenticate('exampleauth', { scope: ['list-routers'] }));
app.get('/auth/example-oauth2orize/callback', passport.authenticate('exampleauth', { failureRedirect: '/error?error=foo' }));

app.get('/externalapi/account', function(req, res, next) {
  console.log(req.user)
  request({
    url: conf.provider.url + '/api/routers',
    headers: { 'Authorization': 'Bearer ' + req.user.accessToken, 'X-pd-extension': 'extension' }
  }, function(error, response, body) {
    console.log("Where the hell are we? ")

    if (!error && response.statusCode === 200) {
      // res.end(body);
      console.log("BODY")
      cosole.log("Body: ", body)
      res.render('routers', { routers: body });
    } else {
      console.log("body?")
      res.end('error: \n' + body);
    }
  });
});

// Server Setup
// Retrieves the port from the configuration URL. Not clean, but this is not meant for production
var split = conf.consumer.url.split(':')
var port = split[split.length - 1]

console.log("Demo consumer running at: ", conf.consumer.url);
app.listen(port);
