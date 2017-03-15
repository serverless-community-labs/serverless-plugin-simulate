'use strict'

const createInput = require('./input')

describe('input', () => {
  it('should contain body as string', () => {
    const req = {}
    const headers = {}
    const body = { test: 'json' }

    const input = createInput(req, headers, body)

    expect(input.body).toEqual('{"test":"json"}')
  })

  it('should return value from json path', () => {
    const req = {}
    const headers = {}
    const body = {
      a: {
        test: 'json',
      },
    }

    const input = createInput(req, headers, body)
    const value = input.json('$.a.test')
    expect(value).toEqual('"json"')
  })

  it('should return params', () => {
    const headers = {}
    const req = {
      params: { a: 'test' },
      query: { qs: '1' },
      headers,
    }
    const body = {
      a: {
        test: 'json',
      },
    }

    const input = createInput(req, headers, body)
    const params = input.params()
    expect(params).toEqual({
      path: req.params,
      querystring: req.query,
      header: headers,
    })
  })

  it('should return param from req.params', () => {
    const headers = {}
    const req = {
      params: { a: 'test' },
      query: { qs: '1' },
      headers,
    }
    const body = {
      a: {
        test: 'json',
      },
    }

    const input = createInput(req, headers, body)
    const params = input.params('a')
    expect(params).toEqual('test')
  })

  it('should return param from query string', () => {
    const headers = {}
    const req = {
      params: { },
      query: { a: 'test' },
      headers,
    }
    const body = {
      a: {
        test: 'json',
      },
    }

    const input = createInput(req, headers, body)
    const params = input.params('a')
    expect(params).toEqual('test')
  })

  it('should return param from headers', () => {
    const headers = { a: 'test' }
    const req = {
      params: { },
      query: { },
      headers,
    }
    const body = {
      a: {
        test: 'json',
      },
    }

    const input = createInput(req, headers, body)
    const params = input.params('a')
    expect(params).toEqual('test')
  })
})
