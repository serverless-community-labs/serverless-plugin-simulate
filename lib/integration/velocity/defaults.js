'use strict'

const JSON_REQUEST_TEMPLATE = `
  #define( $loop )
    {
    #foreach($key in $map.keySet())
        "$util.escapeJavaScript($key)":
          "$util.escapeJavaScript($map.get($key))"
          #if( $foreach.hasNext ) , #end
    #end
    }
  #end

  {
    "body": $input.json("$"),
    "method": "$context.httpMethod",
    "principalId": "$context.authorizer.principalId",
    "stage": "$context.stage",

    #set( $map = $input.params().header )
    "headers": $loop,

    #set( $map = $input.params().querystring )
    "query": $loop,

    #set( $map = $input.params().path )
    "path": $loop,

    #set( $map = $context.identity )
    "identity": $loop,

    #set( $map = $stageVariables )
    "stageVariables": $loop
  }
`


const RESPONSE_STATUS_CODES = {
  200: {
    pattern: '',
  },
  400: {
    pattern: '.*\\[400\\].*',
  },
  401: {
    pattern: '.*\\[401\\].*',
  },
  403: {
    pattern: '.*\\[403\\].*',
  },
  404: {
    pattern: '.*\\[404\\].*',
  },
  422: {
    pattern: '.*\\[422\\].*',
  },
  500: {
    pattern: '.*(Process\\s?exited\\s?before\\s?completing\\s?request|\\[500\\]).*',
  },
  502: {
    pattern: '.*\\[502\\].*',
  },
  504: {
    pattern: '.*\\[504\\].*',
  },
}

module.exports = {
  JSON_REQUEST_TEMPLATE,
  RESPONSE_STATUS_CODES,
}
