import {createClient} from '../../main/ts'

describe('@qiwi/ldap-client', () => {
  describe('createClient', () => {
    it('returns new LDAP client instance', async() => {
      const client = await createClient({url: 'ldap://qiwi.com'})

      expect(client).not.toBeUndefined()
      await client.destroy()
    })
  })
})
