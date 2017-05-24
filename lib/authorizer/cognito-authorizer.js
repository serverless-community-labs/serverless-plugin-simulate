'use strict'

const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')
const rp = require('request-promise')

const fetchJWKs = (issUrl) => rp({
  method: 'GET',
  json: true,
  uri: `${issUrl}/.well-known/jwks.json`,
}).then((jwks) =>
  // Convert keys to PEM format
  jwks.keys.reduce((result, key) =>
    Object.assign(result, {
      [key.kid]: jwkToPem({
        e: key.e,
        n: key.n,
        kty: key.kty,
      }),
    }), {})
)

// const generatePolicy =

const authorize = (lambda, context, authorizationToken, log) => {
  // Parse JWT from the token to retrieve the ISS
  const decodedToken = jwt.decode(authorizationToken, { complete: true })
  const issUrl = decodedToken.payload.iss

  fetchJWKs(issUrl)
    .then((pems) => {
      const pem = pems[decodedToken.header.kid]

      jwt.verify(authorizationToken, pem, { issuer: issUrl }, (err, payload) => {
        if (err) {
          throw err
        }

        const principalId = payload.sub

        const apiOptions = {
          region: context.region,
          restApiId: context.apiId,
          stage: context.stage,
        }

        // Generate policy and return it
      })
    })
}

module.exports = {
  authorize,
}
