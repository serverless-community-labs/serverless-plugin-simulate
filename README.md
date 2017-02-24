# Serverless docker plugin

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![Build Status](https://travis-ci.org/gertjvr/serverless-docker.svg?branch=master)](https://travis-ci.org/gertjvr/serverless-docker)
[![npm version](https://badge.fury.io/js/serverless-docker.svg)](https://badge.fury.io/js/serverless-docker)
[![Coverage Status](https://coveralls.io/repos/github/gertjvr/serverless-docker/badge.svg?branch=master)](https://coveralls.io/github/gertjvr/serverless-docker?branch=master)
[![dependencies](https://img.shields.io/david/gertjvr/serverless-docker.svg)](https://www.npmjs.com/package/serverless-docker)
[![license](https://img.shields.io/npm/l/serverless-docker.svg)](https://www.npmjs.com/package/serverless-docker)

This is a proof of concept to see if we can replicate Amazon API Gateway using docker images to run lambda

### Features:

- λ runtimes **supported** _by docker-lambda._
- CORS
- Authorizer
  - Custom Authorizer **supported**
  - Coginito Authorizer **not implemented yet**
- Lambda Integration
  - _Velocity templates support._ **supported**
- Lambda Proxy Integration. **supported**

## Prerequisite
- docker - https://docs.docker.com/engine/installation/

## Getting Started
Install the plugin
```
npm i --save-dev serverless-docker
```

Configure your service to use the plugin

```yaml
service: my-service
provider:
  name: aws
  runtime: nodejs4.3 # python2.7 is also supported

plugins:
  - serverless-docker
```

If you do not need to chain functions locally
you can just run the API Gateway simulation by itself.
```
sls simulate apigateway start -p 5000
```

### Using the Lambda simulator
If you want to chain functions locally, you need to use
the Lambda Simulator.

Run the Lambda Simulation
```
sls simulate lambda start -p 4000
```

Run the API Gateway Simulation
```
sls simulate apigateway start -p 5000 --lambda-port 4000
```

Use the environment variables to configure the AWS SDK
to use the local Lambda simulation. You can use the same
technique with any other AWS SDK.

```js
const AWS = require('aws-sdk');

const endpoint = process.env.SERVERLESS_SIMULATE ?
  process.env.SERVERLESS_SIMULATE_LAMBDA_ENDPOINT :
  undefined

const lambda = new AWS.Lambda({ endpoint })
const handler = (event, context, callback) => {
  const params = {
    FunctionName: 'my-other-function',
    Payload: JSON.stringify({ foo: 'bar' })
  }
  lambda.invoke(params, (err, result) => {
    if (err) {
      return callback(err)
    }

    callback(null, {
      statusCode: 200,
      body: result.Payload
    })
  })
}
```

## Examples

See the [examples folder](https://github.com/gertjvr/serverless-docker/tree/master/examples)
for examples.

- `npm install` - Installs all dependencies
- `npm start` - Starts API Gateway simulation listening at http://localhost:5000
- `npm run start:lambda` - Starts Lambda simulation listening at http://localhost:4000
- `npm run start:apigateway` - Starts API Gateway simulation that uses the Lambda simulation listening at http://localhost:5000
- `npm test` - tests custom authorizer (Authorization:TOKEN 12345)

## Contributing
Please create an issue before submitting an Pull Request.

## Acknowledgements
This would not be possible without [lambci](http://lambci.org/)
- [docker-lambda](https://github.com/lambci/docker-lambda) - Docker images and test runners that replicate the live AWS Lambda environment

[@johncmckim](https://github.com/johncmckim) for suggesting the idea
