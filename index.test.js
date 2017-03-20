'use strict'

const Simulate = require('./index')

describe('index', () => {
  describe('initConfig', () => {
    it('should get dist config in Simulate instance', () => {
      const serverless = {
        service: {
          custom: {
            simulate: {
              dist: 'dist',
            },
          },
        },
      }
      const instance = new Simulate(serverless, {})
      expect(instance.dist).toBe('/dist')
    })
    it('should get dist config in Simulate instance is empty', () => {
      const serverless = {
        service: {
          custom: {
            simulate: {
            },
          },
        },
      }
      const instance = new Simulate(serverless, {})
      expect(instance.dist).toBe('')
    })
  })
})
