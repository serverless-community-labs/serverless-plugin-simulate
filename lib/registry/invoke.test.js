const BbPromise = require('bluebird')
const invoke = require('./invoke')
const data = require('./data')

jest.mock('./data')

describe('invoke20150331', () => {
  it('should return 200 when lambda result is ok', () => {
    const mockLambda = {
      invoke: () => (
        BbPromise.resolve({
          result: 'Test',
        })
      ),
    }

    const requestMock = {
      params: {
        functionName: 'Test',
      },
      logger: jest.fn(),
      get: () => ('RequestResponse'),
    }

    const responseMock = {
      status: jest.fn(),
      send: jest.fn(),
    }

    data.getFunction.mockReturnValue(BbPromise.resolve({}))
    return invoke.invoke20150331(mockLambda, {}, requestMock, responseMock)
      .then(() => {
        expect(responseMock.status.mock.calls[0][0]).toEqual(200)
        data.getFunction.mockClear()
      })
  })

  it('should return \'X-Amz-Function-Error\' when lambda returns errorMessage', () => {
    const mockLambda = {
      invoke: () => (
        BbPromise.resolve({
          errorMessage: 'Test',
        })
      ),
    }

    const requestMock = {
      params: {
        functionName: 'Test',
      },
      logger: jest.fn(),
      get: () => ('RequestResponse'),
    }

    const responseMock = {
      status: jest.fn(),
      set: jest.fn(),
      send: jest.fn(),
    }

    data.getFunction.mockReturnValue(BbPromise.resolve({}))
    return invoke.invoke20150331(mockLambda, {}, requestMock, responseMock)
      .then(() => {
        expect(responseMock.set.mock.calls[0][0]).toEqual('X-Amz-Function-Error')
        data.getFunction.mockClear()
      })
  })
})
