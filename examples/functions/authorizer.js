'use strict';

const utils = require('api-gateway-policy-gen').utils;
const policyGenerator = require('api-gateway-policy-gen').policyGenerator;

module.exports.handler = (event, context, callback) => {
  if (!event.authorizationToken) {
    console.error('JWT token not present')
    context.fail('Unauthorized')
    return
  }

  if (!event.authorizationToken.startsWith('TOKEN')) {
    return cb('No auth token supplied');
  }

  const tokens = event.authorizationToken.split(' ')
  const principalId = tokens[1]

  const authInfo = utils.getAuthInfo(event.methodArn)

  // allow access to all methods
  const result = policyGenerator.generatePolicy(principalId, authInfo, [{
    allow: true,
    methods: [{
      verb: 'GET',
      resource: 'bff'
    }],
  }, {
    allow: true,
    methods: [{
      verb: 'GET',
      resource: 'error'
    }],
  }, {
    allow: true,
    methods: [{
      verb: '*',
      resource: 'lambda'
    }],
  }, {
    allow: true,
    methods: [{
      verb: '*',
      resource: 'lambda-proxy'
    }],
  }, {
    allow: false,
    methods: [{
      verb: 'GET',
      resource: 'unauthorized'
    }],
  }]);

  console.log('Returning result')

  callback(null, result);
}
