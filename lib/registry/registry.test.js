'use strict'

const data = require('./data')
const registry = require('./registry')

const dbPath = '.sls-simulate-registry'
let db = null


describe('registry', () => {
  describe('putFunctions', () => {
    let dist = 'dist'
    const key = 'serverlessInit-local-lambdaInvoke'
    const req = {
      body: {
        functions: [
          {
            key,
            serviceName: 'serverlessInit',
            servicePath: '/serverlessInit',
            region: 'local',
            stage: 'local',
            functionName: 'lambdaInvoke',
            handler: 'services/handler/handler.lambdaInvoke',
            runtime: 'nodejs4.3',
          },
        ],
      },
    }
    beforeAll(() => {
      db = data.createDb(dbPath)
    })
    it('should update the function servicePath with dist', (done) => {
      const res = {
        status: (code) => {
          expect(code).toBe(200)
        },
        send: () => {
          data.getFunction(db, key)
          .then((_data) => {
            expect(_data.servicePath)
            .toEqual(`${req.body.functions[0].servicePath}${dist}`)
            done()
          }).error((err) => {
            expect(err).toBeUndefined()
            done()
          })
        },
      }
      registry.putFunctions(db, req, res, dist)
    })
    it('should update the function servicePath without dist', (done) => {
      dist = ''
      const res = {
        status: (code) => {
          expect(code).toBe(200)
        },
        send: () => {
          data.getFunction(db, key)
          .then((_data) => {
            expect(_data.servicePath)
            .toEqual(`${req.body.functions[0].servicePath}`)
            done()
          }).error((err) => {
            expect(err).toBeUndefined()
            done()
          })
        },
      }
      registry.putFunctions(db, req, res, dist)
    })
  })
})
