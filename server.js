'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const request = require('request');

const chuteConfig = require('./chute.json');
const conf = require('./config');

// Setup the app
const app = express();
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(errorHandler());
app.use(session({ secret: 'random string', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

// Serializing a user object into the session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const port = process.env.PORT || 3004;

passport.use('example-oauth2', new OAuth2Strategy({
  clientID: clientId,
  clientSecret: clientSecret,
  authorizationURL: conf.oauth2.url + conf.oauth2.authorizationRoute,
  tokenURL: conf.oauth2.url + conf.oauth2.tokenRoute,
  callbackURL: conf.oauth2.callbackUrl
}, (accessToken, refreshToken, profile, done) => {
  done(null, { accessToken: accessToken });
}))

// Routing
app.get('/auth/oauth2',
  passport.authenticate('example-oauth2', {
    scope: ['list-routers', 'install-chute']
  })
);
app.get('/auth/oauth2/callback',
  passport.authenticate('example-oauth2', {
    failureRedirect: '/error?error=foo'
  })
);
app.get('/auth/oauth2/callback', (req, res) => res.render('authed'));

app.get('/', (req, res, next) => res.render('index'));
app.get('/error', (req, res, next) => res.render('error'));

app.get('/choose-router', (req, res, next) => {
  request({
    url: conf.oauth2.url + '/api/routers',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken,
      'x-pd-application': 'application'
    }
  }, (error, response, body) => {
    if (error) {
      return res.end(error);
    }

    if (response.statusCode !== 200) {
      return res.end(response.body);
    }

    res.render('routers', { routers: JSON.parse(body) });
  })
})

app.get('/install-chute', (req, res, next) => {
  const router_id = req.query.id;

  request.post({
    url: conf.oauth2.url + '/api/routers/' + router_id + '/updates',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken,
      'x-pd-application': 'application'
    },
    json: {
      "updateClass": "CHUTE",
      "updateType": "update",
      "config": chuteConfig
    }
  }, (error, response, body) => {
    if (error) {
      console.log("ERROR", error);
      return res.end("Error: ", error);
    }

    res.redirect(conf.oauth2.url + '/routers/' + router_id + '/updates/' + body._id);
  });
});

// Start the server
app.listen(port, () => {
  console.log('Demo consumer running at port: ' + port);
});
