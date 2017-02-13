# Serverless docker plugin

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![Build Status](https://travis-ci.org/gertjvr/serverless-docker.svg?branch=master)](https://travis-ci.org/gertjvr/serverless-docker)
[![npm version](https://badge.fury.io/js/serverless-docker.svg)](https://badge.fury.io/js/serverless-docker)
[![Coverage Status](https://coveralls.io/repos/github/gertjvr/serverless-docker/badge.svg?branch=master)](https://coveralls.io/github/gertjvr/serverless-docker?branch=master)
[![dependencies](https://img.shields.io/david/gertjvr/serverless-docker.svg)](https://www.npmjs.com/package/serverless-docker)
[![license](https://img.shields.io/npm/l/serverless-docker.svg)](https://www.npmjs.com/package/serverless-docker)

This is a proof of concept to see if we can replicate Amazon API Gateway using docker images to run lambda

###Features:

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

## Getting started
- `npm install` - Installs all dependencies
- `npm start` - Starts server listening at http://localhost:4000
- `npm test` - tests custom authorizer (Authorization:TOKEN 12345)

## Acknowledgements
This would not be possible without [lambci](http://lambci.org/)
- [docker-lambda](https://github.com/lambci/docker-lambda) - Docker images and test runners that replicate the live AWS Lambda environment

[@johncmckim](https://github.com/johncmckim) for suggesting the idea
