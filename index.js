const express = require('express');
const morgan = require('morgan');
const OAuthServer = require('express-oauth-server');

const app = express();

app.oauth = new OAuthServer({
  model: require('./model'), // See https://github.com/oauthjs/node-oauth2-server for specification
});

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/oauth/token', app.oauth.token());

app.get('/secret', app.oauth.authenticate(), function (req, res) {
  res.send('Secret area');
});

app.get('/public', function (req, res) {
  res.send('Public area');
});

app.listen(3000);
