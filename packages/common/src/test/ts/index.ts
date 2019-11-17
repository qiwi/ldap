import {ldapClientFactory, SessionLdapProvider} from '../../main/ts'
import {ISessionProvider} from '../../../target/es5'

describe('@qiwi/ldap-common', () => {
  describe('index', () => {
    it('properly exposes its inners', () => {
      expect(ldapClientFactory).toBeTruthy()
    })
  })

  describe('methods works correctly', () => {
    const testSessionProviderFactory = (): ISessionProvider => {
      const inMemoryStorage: {
        [key: string]: any
      } = {}

      function generateToken({userData, ldapData}: {ttl?: number, userData: {username: string, password: string}, ldapData: string}) {
        const token = userData.username + userData.password + 'token'
        inMemoryStorage[token] = {ldapData, ttl: 100}
        return Promise.resolve(token)
      }

      function refreshToken(token: string) {
        if (!inMemoryStorage[token]) {
          return Promise.reject('invalid token')
        }

        const {ldapData} = inMemoryStorage[token]
        inMemoryStorage[token] = undefined
        const newToken = token + 'token'
        inMemoryStorage[newToken] = {ldapData, ttl: 200}
        return Promise.resolve(token)
      }

      function revokeToken(token: string) {
        if (!inMemoryStorage[token]) {
          return Promise.resolve(false)
        }

        delete inMemoryStorage[token]
        return Promise.resolve(true)
      }

      function appendData({token, data}: {token: string, data: {[key: string]: any}}) {
        if (!inMemoryStorage[token]) {
          return Promise.resolve(false)
        }
        inMemoryStorage[token] = {
          ...inMemoryStorage[token],
          ...data,
        }

        return Promise.resolve(true)
      }

      function getDataByToken(token: string) {
        if (!inMemoryStorage[token]) {
          return 'invalid token'
        }

        return inMemoryStorage[token]
      }

      return {
        generateToken,
        refreshToken,
        revokeToken,
        appendData,
        getDataByToken,
      }
    }
    const testSessionProvider = testSessionProviderFactory()

    const testADProvider = {
      findUser: (username: string, cb: (_: null, res: string) => void) => cb(null, username + ' found'),
      getGroupMembershipForUser: (username: string, cb: (_: null, res: string) => void) => {
        return cb(null, username + ' groups')
      },
      authenticate: (_: string, __: string, cb: (_: null, res: boolean) => void) => cb(null, true),
    }

    const ldapProvider = new SessionLdapProvider(
      testADProvider,
      testSessionProvider,
      'test',
    )

    it('checkCred', () => {
      ldapProvider.checkCred('foo', 'bar')
        .then(res => {
          expect(res).toMatchObject({login: 'foo', result: true})
        })
        .catch(console.log)
    })

    it('login', () => {
      ldapProvider.login('foo', 'bar', 0)
        .then(res => {
          expect(res).toEqual('foobartoken')
          expect(ldapProvider.getDataByToken(res)).toMatchObject({ldapData: 'foo groups', ttl: 100})
        })
        .catch(console.log)
    })

    it('logout', () => {
      ldapProvider
        .login('foo', 'bar', 0)
        .catch(console.log)
      ldapProvider.logout('foobartoken')
        .then((res) => {
          expect(res).toEqual(true)
          expect(ldapProvider.getDataByToken('foobartoken')).toEqual('invalid token')
        })
        .catch(console.log)
    })

    it('findGroupByUser', () => {
      ldapProvider.findGroupByUser('foo')
        .then((res: any) => {
          expect(res).toEqual('foo groups')
        })
        .catch(console.log)
    })

    it('getDataByToken', async() => {
      const token = await ldapProvider.login('foo', 'bar', 100)
      expect(token).toEqual('foobartoken')
      const ldapData = await ldapProvider.getDataByToken('foobartoken')
      expect(ldapData).toMatchObject({ldapData: 'foo groups', ttl: 100})
      await ldapProvider.logout(token)
      const deleteLdapData = await ldapProvider.getDataByToken('foobartoken')
      expect(deleteLdapData).toEqual('invalid token')
    })
  })
})
