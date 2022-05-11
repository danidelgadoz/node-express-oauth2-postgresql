/**
 * Module dependencies.
 */

var pgp = require('pg-promise')();
var pg = pgp('postgresql://postgres:secret@localhost:5432/oauth2');

/*
 * Get access token.
 */

module.exports.getAccessToken = function (accessToken) {
  return pg
    .query(
      'SELECT access_token, access_token_expires_on, client_id, user_id FROM oauth_tokens WHERE access_token = $1',
      [accessToken]
    )
    .then(function (result) {
      const token = result[0];

      if (!token) {
        return;
      }

      return {
        accessToken: token.access_token,
        accessTokenExpiresAt: token.access_token_expires_on,
        client: { id: token.client_id },
        user: { id: token.user_id },
      };
    });
};

/**
 * Get client.
 */

module.exports.getClient = function* (clientId, clientSecret) {
  return pg
    .query(
      'SELECT client_id, redirect_uri FROM oauth_clients WHERE client_id = $1 AND client_secret = $2',
      [clientId, clientSecret]
    )
    .then(function (result) {
      var client = result[0];

      if (!client) {
        return;
      }

      return {
        id: client.client_id,
        redirectUris: client.redirect_uri,
        grants: ['password', 'refresh_token'],
      };
    });
};

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = function* (refreshToken) {
  return pg
    .query(
      'SELECT refresh_token, refresh_token_expires_on, client_id, user_id FROM oauth_tokens WHERE refresh_token = $1',
      [refreshToken]
    )
    .then(function (result) {
      const token = result[0];

      if (!token) {
        return;
      }

      return {
        refreshToken: token.refresh_token,
        refreshTokenExpiresAt: token.refresh_token_expires_on,
        client: { id: token.client_id },
        user: { id: token.user_id },
      };
    });
};

/*
 * Get user.
 */

module.exports.getUser = function* (username, password) {
  return pg
    .query('SELECT id FROM users WHERE username = $1 AND password = $2', [
      username,
      password,
    ])
    .then(function (result) {
      return result[0];
    });
};

/**
 * Save token.
 */

module.exports.saveToken = function* (token, client, user) {
  const { v4: uuidv4 } = require('uuid');
  return pg
    .query(
      'INSERT INTO oauth_tokens(id, access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        uuidv4(),
        token.accessToken,
        token.accessTokenExpiresAt,
        client.id,
        token.refreshToken,
        token.refreshTokenExpiresAt,
        user.id,
      ]
    )
    .then(function (result) {
      return {
        ...token,
        client: { id: client.id },
        user: { id: user.id },
      };
    });
};

/**
 * revoke Token.
 */
module.exports.revokeToken = function (token) {
  return pg
    .query('DELETE FROM oauth_tokens WHERE refresh_token = $1', [
      token.refreshToken,
    ])
    .then(function (result) {
      return true;
    });
};
