'use strict'

jest.mock('child_process', () => ({
  spawn: jest.fn(),
}))

const spawn = require('child_process').spawn
const run = require('./run')

const spawnResultFactory = (stdout, stderr, code) => ({
  stdout: {
    on: (evt, cb) => {
      expect(evt).toBe('data')
      cb(stdout)
    },
  },

  stderr: {
    on: (evt, cb) => {
      expect(evt).toBe('data')
      cb(stderr)
    },
  },
  on: (evt, cb) => {
    expect(evt).toBe('close')
    cb(code)
  },
})

describe('run', () => {
  beforeEach(() => {
    spawn.mockClear()
  })

  it('should spawn docker', () => {
    const taskDir = 'taskDir'

    const opt = {
      taskDir,
    }

    const stdout = 'stdout\n'
    const stderr = 'stderr\n'
    const code = 0

    spawn.mockImplementation(() => spawnResultFactory(stdout, stderr, code))

    return run(opt).then((result) => {
      expect(spawn.mock.calls.length).toBe(1)
      expect(spawn.mock.calls[0][0]).toBe('docker')
      expect(spawn.mock.calls[0][1]).toEqual([
        'run',
        '-v', `${taskDir}:/var/task`,
        '--rm',
        'lambci/lambda',
        'index.handler',
        '{}',
      ])
      expect(spawn.mock.calls[0][2]).toEqual({ encoding: 'utf8' })

      expect(result).toEqual({
        code,
        stdout,
        stderr,
      })
    })
  })

  it('should spawn docker with env vars', () => {
    const taskDir = 'taskDir'

    const opt = {
      taskDir,
      addEnvVars: true,
    }

    const stdout = 'stdout\n'
    const stderr = 'stderr\n'
    const code = 0

    spawn.mockImplementation(() => spawnResultFactory(stdout, stderr, code))

    return run(opt).then((result) => {
      expect(spawn.mock.calls.length).toBe(1)
      expect(spawn.mock.calls[0][0]).toBe('docker')
      expect(spawn.mock.calls[0][1]).toEqual([
        'run',
        '-v', `${taskDir}:/var/task`,
        '--rm',
        '-e',
        'AWS_REGION',
        '-e',
        'AWS_DEFAULT_REGION',
        '-e',
        'AWS_ACCOUNT_ID',
        '-e',
        'AWS_ACCESS_KEY_ID',
        '-e',
        'AWS_SECRET_ACCESS_KEY',
        '-e',
        'AWS_SESSION_TOKEN',
        '-e',
        'AWS_LAMBDA_FUNCTION_NAME',
        '-e',
        'AWS_LAMBDA_FUNCTION_VERSION',
        '-e',
        'AWS_LAMBDA_FUNCTION_MEMORY_SIZE',
        '-e',
        'AWS_LAMBDA_FUNCTION_TIMEOUT',
        '-e',
        'AWS_LAMBDA_FUNCTION_HANDLER',
        '-e',
        'AWS_LAMBDA_EVENT_BODY',
        'lambci/lambda',
        'index.handler',
        '{}',
      ])
      expect(spawn.mock.calls[0][2]).toEqual({ encoding: 'utf8' })

      expect(result).toEqual({
        code,
        stdout,
        stderr,
      })
    })
  })
})
