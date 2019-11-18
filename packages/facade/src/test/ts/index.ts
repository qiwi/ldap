import {SessionLdapProvider, LdapGuard} from '../../main/ts'

describe('@qiwi/ldap-common', () => {
  describe('index', () => {
    it('properly exposes its inners', () => {
      expect(SessionLdapProvider).not.toBeUndefined()
      expect(LdapGuard).not.toBeUndefined()
    })
  })
})
