var connect = require('connect'),
  passport = require('passport'),
  express = require('express'),
  request = require('request'),
  conf = require('./config'),
  express_handlebars = require('express-handlebars'),
  OAuth2Strategy = require('passport-oauth').OAuth2Strategy

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

// Use handlebars to template
app.engine('html', express_handlebars({ extname: '.html' }))
app.set('view engine', 'html')

// Serializing a user object into the session
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((obj, done) => done(null, obj))

passport.use('exampleauth', new OAuth2Strategy({
  clientID: conf.consumer.clientId,
  clientSecret: conf.consumer.clientSecret,
  authorizationURL: conf.provider.url + conf.provider.authorization_route,
  tokenURL: conf.provider.url + conf.provider.token_route,
  callbackURL: conf.consumer.url + "/auth/example-oauth2orize/callback"
}, (accessToken, refreshToken, profile, done) => {
  done(null, { accessToken: accessToken })
}))

// Routing
app.get('/auth/example-oauth2orize', passport.authenticate('exampleauth', { scope: ['list-routers', 'install-chute'] }))
app.get('/auth/example-oauth2orize/callback', passport.authenticate('exampleauth', { failureRedirect: '/error?error=foo' }))

app.get('/', (req, res, next) => res.render('index'))
app.get('/error', (req, res, next) => res.render('error'))
app.get('/auth/example-oauth2orize/callback', (req, res) => res.render('authed'))

app.get('/choose-router', (req, res, next) => {
  request({
    url: conf.provider.url + '/api/routers',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken,
      'x-pd-application': 'application'
    }
  }, (error, response, body) => {
    if (error) {
      return res.end(error)
    }

    if (response.statusCode !== 200) {
      return res.end(response.body)
    }

    res.render('routers', { routers: JSON.parse(body) })
  })
})

app.get('/install-chute', (req, res, next) => {
  var router_id = req.param('id')

  request.post({
    url: conf.provider.url + '/api/routers/' + router_id + '/updates',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken,
      'x-pd-application': 'application'
    },
    json: {
      "updateClass": "CHUTE",
      "updateType": "update",
      "chute_id": "59034edfbf2e9ff97ba46135",
      "version_id": "59034edfbf2e9ff97ba46136",
      "config": {
        "name": "hello-world",
        "host_config": {
          "port_bindings": {
            "80": 8000
          }
        },
        "dockerfile": '# hello-world # # Version 0.0.1 FROM nginx MAINTAINER Paradrop Team <info@paradrop.io> RUN echo ' +
          '"Hello World from Paradrop!" > /usr/share/nginx/html/index.html',
        "version": 1
      }
    }
  }, (error, response, body) => {
    if (error) {
      console.log("ERROR", error)
      return res.end("Error: ", error)
    }

    res.redirect(conf.provider.url + '/routers/' + router_id + '/updates/' + body._id)
  })
})

// Retrieves the port from the configuration URL. Not clean, but this is not meant for production
var split = conf.consumer.url.split(':')
var port = split[split.length - 1]

// Start the server
console.log("Demo consumer running at: ", conf.consumer.url)
app.listen(port)
