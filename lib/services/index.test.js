'use strict'

jest.mock('child_process', () => ({
  spawnSync: jest.fn(),
}))

jest.mock('fs', () => ({
  existsSync: jest.fn(),
}))

const fs = require('fs')
const spawnSync = require('child_process').spawnSync
const index = require('./index')

describe('start', () => {
  beforeEach(() => {
    fs.existsSync.mockClear()
    spawnSync.mockClear()
  })

  it('should spawn docker-compose', () => {
    const opt = {
      file: 'docker-compose.yml',
      host: 'localhost',
    }
    const log = jest.fn()

    const spawnResult = {
      status: 0,
      stderr: '',
    }

    fs.existsSync.mockImplementation(() => true)
    spawnSync.mockImplementation(() => spawnResult)

    index.start(opt, log)

    expect(spawnSync.mock.calls.length).toBe(1)
    expect(spawnSync.mock.calls[0][0]).toBe('docker-compose')
    expect(spawnSync.mock.calls[0][1]).toEqual([
      '--file', 'docker-compose.yml',
      '--host', 'localhost',
      'up', '-d',
    ])
    expect(spawnSync.mock.calls[0][2]).toEqual({ encoding: 'utf8' })
  })

  it('should spawn docker-compose with project-name', () => {
    const opt = {
      file: 'docker-compose.yml',
      host: 'localhost',
      projectName: 'testproject',
    }
    const log = jest.fn()

    const spawnResult = {
      status: 0,
      stderr: '',
    }

    fs.existsSync.mockImplementation(() => true)
    spawnSync.mockImplementation(() => spawnResult)

    index.start(opt, log)

    expect(spawnSync.mock.calls.length).toBe(1)
    expect(spawnSync.mock.calls[0][0]).toBe('docker-compose')
    expect(spawnSync.mock.calls[0][1]).toEqual([
      '--file', 'docker-compose.yml',
      '--host', 'localhost',
      '--project-name', 'testproject',
      'up', '-d',
    ])
    expect(spawnSync.mock.calls[0][2]).toEqual({ encoding: 'utf8' })
  })
})
