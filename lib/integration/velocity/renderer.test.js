'use strict'

const renderer = require('./renderer')

describe('renderer', () => {
  describe('render', () => {
    it('should create context', () => {
      const template = '#set( $foo = "Foo" )Hello $foo $bar'

      const actual = renderer.render(template, { bar: 'Bar' })
      expect(actual).toEqual('Hello Foo Bar')
    })
  })
})
