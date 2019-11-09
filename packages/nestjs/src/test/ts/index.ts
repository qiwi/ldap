import {foo} from '../../main/ts'

describe('@qiwi/ldap-common', () => {
  describe('index', () => {
    it('properly exposes its inners', () => {
      expect(foo).toBe('bar')
    })
  })
})
