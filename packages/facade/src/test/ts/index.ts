import {foo, baz} from '../../main/ts'

describe('@qiwi/ldap-common', () => {
  describe('index', () => {
    it('properly exposes its inners', () => {
      expect(foo).toBe('bar')
      expect(baz).toBe('qux')
    })
  })
})
