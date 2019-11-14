import {ldapClientFactory} from '../../main/ts'

describe('@qiwi/ldap-common', () => {
  describe('index', () => {
    it('properly exposes its inners', () => {
      expect(ldapClientFactory).toBeTruthy()
    })
  })

  describe('methods works correctly', () => {
    const activeDirectoryConfig = {
      'instanceConfig': {
        url: 'ldaps://hq.test.com/',
        baseDN: 'DC=test',
        username: 'user',
        password: 'pass',
        tlsOptions: {
          rejectUnauthorized: false,
        },
      },
      'groups': [],
      'userPostfix': '@hq.test.com',
    }

    type IToken = string

    interface ISessionProvider {
      generateToken: ({ttl, userData, ldapData}: {ttl?: number, userData: {username: string, password: string}, ldapData: string}) => IToken
      refreshToken: (token: IToken) => IToken,
      revokeToken: (token: IToken) => boolean,
      appendData: ({token, data}: { token: IToken, data: any }) => IToken
      getDataByToken: (token: IToken) => any
    }

    const testSessionProviderFactory = (): ISessionProvider => {
      const inMemoryStorage: {
        [key: string]: any
      } = {}

      function generateToken({userData, ldapData}: {ttl?: number, userData: {username: string, password: string}, ldapData: string}) {
        const token = userData.username + userData.password + 'token'
        inMemoryStorage[token] = {ldapData, ttl: 100}
        return token
      }

      function refreshToken(token: string) {
        if (!inMemoryStorage[token]) {
          return 'invalid token'
        }

        const {ldapData} = inMemoryStorage[token]
        inMemoryStorage[token] = undefined
        const newToken = token + 'token'
        inMemoryStorage[newToken] = {ldapData, ttl: 200}
        return token
      }

      function revokeToken(token: string) {

        if (!inMemoryStorage[token]) {
          return false
        }

        delete inMemoryStorage[token]
        return true
      }

      function appendData({token, data}: {token: string, data: {[key: string]: any}}) {
        if (!inMemoryStorage[token]) {
          return 'invalid token'
        }
        inMemoryStorage[token] = {
          ...inMemoryStorage[token],
          ...data,
        }

        return token
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

    const ldapClient = ldapClientFactory({
      sessionProvider: testSessionProvider,
      ldapConfig: activeDirectoryConfig,
      ldapProvider: testADProvider,
    })

    it('checkCred', () => {
      ldapClient.checkCred('foo', 'bar')
        .then(res => {
          expect(res).toMatchObject({login: 'foo', result: true})
        })
        .catch(console.log)
    })

    it('login', () => {
      ldapClient.login('foo', 'bar', 0)
        .then(res => {
          expect(res).toEqual('foobartoken')
          expect(ldapClient.getDataByToken(res)).toMatchObject({ldapData: 'foo groups', ttl: 100})
        })
        .catch(console.log)
    })

    it('logout', () => {
      ldapClient.logout('foo')
        .then((res) => {
          expect(res).toEqual(true)
          expect(ldapClient.getDataByToken('foobartoken')).toEqual(undefined)
        })
        .catch(console.log)
    })

    it('findUser', () => {
      ldapClient.findUser('foo')
        .then((res) => {
          expect(res).toEqual('foo found')
        })
        .catch(console.log)
    })

    it('findGroupByUser', () => {
      ldapClient.findGroupByUser('foo')
        .then((res: any) => {
          expect(res).toEqual('foo groups')
        })
        .catch(console.log)
    })

    it('getDataByToken', async() => {
      const token = await ldapClient.login('foo', 'bar', 100)
      expect(token).toEqual('foobartoken')
      const ldapData = await ldapClient.getDataByToken('foobartoken')
      expect(ldapData).toMatchObject({ldapData: 'foo groups', ttl: 100})
      await ldapClient.logout(token)
      const deleteLdapData = await ldapClient.getDataByToken('foobartoken')
      expect(deleteLdapData).toEqual('invalid token')
    })
  })
})
