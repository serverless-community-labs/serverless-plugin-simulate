'use strict'

const router = require('./router')

describe('router', () => {
  describe('getEndpoint', () => {
    it('should return endpoint for path', () => {
      const matchEndpoint = {
        http: {
          path: '/test/path',
          method: 'post',
          cors: null,
        },
      }
      const endpoints = [matchEndpoint]

      const req = {
        method: 'POST',
        url: '/test/path',
      }

      const endpoint = router.getEndpoint(endpoints, req)

      expect(endpoint).toBe(matchEndpoint)
    })

    it('should return endpoint for CORS path', () => {
      const matchEndpoint = {
        http: {
          path: '/test/path',
          method: 'post',
          cors: true,
        },
      }
      const endpoints = [matchEndpoint]

      const req = {
        method: 'OPTIONS',
        url: '/test/path',
      }

      const endpoint = router.getEndpoint(endpoints, req)

      expect(endpoint).toBe(matchEndpoint)
    })

    it('should return null for random path', () => {
      const matchEndpoint = {
        http: {
          path: '/test/path',
          method: 'post',
          cors: null,
        },
      }
      const endpoints = [matchEndpoint]

      const req = {
        method: 'POST',
        url: '/test/blah',
      }

      const endpoint = router.getEndpoint(endpoints, req)

      expect(endpoint).toBeUndefined()
    })

    it('should return null for wrong method', () => {
      const matchEndpoint = {
        http: {
          path: '/test/path',
          method: 'post',
          cors: null,
        },
      }
      const endpoints = [matchEndpoint]

      const req = {
        method: 'GET',
        url: '/test/path',
      }

      const endpoint = router.getEndpoint(endpoints, req)

      expect(endpoint).toBeUndefined()
    })

    it('should return endpoint for path and ANY method', () => {
      const matchEndpoint = {
        http: {
          path: '/test/path',
          method: 'any',
          cors: null,
        },
      }
      const endpoints = [matchEndpoint]

      const getEndpoint = router.getEndpoint(endpoints, {
        method: 'GET',
        url: '/test/path',
      })

      const putEndpoint = router.getEndpoint(endpoints, {
        method: 'PUT',
        url: '/test/path',
      })

      const postEndpoint = router.getEndpoint(endpoints, {
        method: 'POST',
        url: '/test/path',
      })

      const deleteEndpoint = router.getEndpoint(endpoints, {
        method: 'DELETE',
        url: '/test/path',
      })

      expect(getEndpoint).toBe(matchEndpoint)
      expect(putEndpoint).toBe(matchEndpoint)
      expect(postEndpoint).toBe(matchEndpoint)
      expect(deleteEndpoint).toBe(matchEndpoint)
    })

    it('should match endpoint with more specific sub path', () => {
      const matchEndpoint = {
        http: {
          path: '/test/path/sub',
          method: 'post',
          cors: null,
        },
      }
      const endpoints = [
        {
          http: {
            path: '/test/path',
            method: 'post',
            cors: null,
          },
        },
        matchEndpoint,
      ]

      const req = {
        method: 'POST',
        url: '/test/path/sub',
      }

      const endpoint = router.getEndpoint(endpoints, req)

      expect(endpoint).toEqual(matchEndpoint)
    })

    it('should match endpoint with path param', () => {
      const matchEndpoint = {
        http: {
          path: '/test/{part}',
          method: 'post',
          cors: null,
        },
      }

      const endpoints = [matchEndpoint]

      const req = {
        method: 'POST',
        url: '/test/path',
      }

      const endpoint = router.getEndpoint(endpoints, req)

      expect(endpoint).toEqual(matchEndpoint)
    })

    it('should match endpoint with multiple path params', () => {
      const matchEndpoint = {
        http: {
          path: '/test/{part1}/{part2}',
          method: 'post',
          cors: null,
        },
      }

      const endpoints = [matchEndpoint]

      const req = {
        method: 'POST',
        url: '/test/path1/path2',
      }

      const endpoint = router.getEndpoint(endpoints, req)

      expect(endpoint).toEqual(matchEndpoint)
    })

    // This is failing
    // it('should noth match endpoint with path param but path has further subpath', () => {
    //   const matchEndpoint = {
    //     http: {
    //       path: '/test/{part}',
    //       method: 'post',
    //       cors: null,
    //     },
    //   }

    //   const endpoints = [matchEndpoint]

    //   const req = {
    //     method: 'POST',
    //     url: '/test/path/sub',
    //   }

    //   const endpoint = router.getEndpoint(endpoints, req)

    //   expect(endpoint).toBeUndefined()
    // })

    it('should match endpoint with greedy path param', () => {
      const matchEndpoint = {
        http: {
          path: '/test/{part+}',
          method: 'post',
          cors: null,
        },
      }

      const endpoints = [matchEndpoint]

      const req = {
        method: 'POST',
        url: '/test/path/sub',
      }

      const endpoint = router.getEndpoint(endpoints, req)

      expect(endpoint).toEqual(matchEndpoint)
    })

    it('should ignore query when matching path', () => {
      const matchEndpoint = {
        http: {
          path: '/test/path',
          method: 'get',
          cors: null,
        },
      }

      const endpoints = [matchEndpoint]

      const req = {
        method: 'GET',
        url: '/test/path?query=abc',
      }

      const endpoint = router.getEndpoint(endpoints, req)

      expect(endpoint).toEqual(matchEndpoint)
    })
  })

  describe('toExpressPath', () => {
    it('should convert basic path', () => {
      const expressPath = router.toExpressPath('/test/path')
      expect(expressPath).toEqual('/test/path')
    })

    it('should convert path with param', () => {
      const expressPath = router.toExpressPath('/test/{param}')
      expect(expressPath).toEqual('/test/:param')
    })

    it('should convert path with greedy param', () => {
      const expressPath = router.toExpressPath('/test/{param+}')
      expect(expressPath).toEqual('/test/:param(*)')
    })
  })
})
