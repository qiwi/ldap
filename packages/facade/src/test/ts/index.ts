import {ldapClientFactory, HasLdapGroup} from '../../main/ts'

describe('@qiwi/ldap-common', () => {
  describe('index', () => {
    it('properly exposes its inners', () => {
      expect(ldapClientFactory).not.toBeUndefined()
      expect(HasLdapGroup).not.toBeUndefined()
    })
  })
})
