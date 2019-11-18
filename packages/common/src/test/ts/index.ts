import {SessionLdapProvider, ISessionProvider} from '../../main/ts'

describe('@qiwi/ldap-common', () => {
  describe('index', () => {
    it('properly exposes its inners', () => {
      expect(SessionLdapProvider).toBeTruthy()
    })
  })

  describe('ldap provider', () => {
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
          return false
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
      getGroupMembershipForUser: (username: string, cb: (_: any, res?: string) => void) => {
        if (username === 'test') {
          return cb('invalid user')
        }
        return cb(null, username + ' groups')
      },
      authenticate: (_: string, pass: string, cb: (err: any, res?: boolean) => void) => {
        if (pass === 'bar') {
          cb(null, true)
        }
        else {
          cb('invalid password', false)
        }
      },
    }

    const ldapProvider = new SessionLdapProvider(
      testADProvider,
      testSessionProvider,
      'test',
    )

    // tslint:disable-next-line:no-empty
    describe('constructor', () => {})

    describe('proto', () => {
      describe('#checkCred', () => {
        it('succeeds on valid creds', async() => {
          return ldapProvider.checkCred('foo', 'bar')
            .then(res => {
              expect(res).toMatchObject({login: 'foo', result: true})
            })
            .catch(console.log)
        })

        it('return `invalid password` otherwise', async() => {
          return ldapProvider.checkCred('foo', 'baz')
            .then(res => {
              expect(res).toBe(false)
            })
            .catch(console.log)
        })

      })

      describe('#login', () => {
        it('succeed on valid creds',() => {
          return ldapProvider.login('foo', 'bar', 0)
            .then(res => {
              expect(res).toBe('foobartoken')
              return res
            })
            .then(res => ldapProvider.getDataByToken(res))
            .then(res => expect(res).toMatchObject({ldapData: 'foo groups', ttl: 100}),
            )
            .catch(console.log)
        })

        it('return `cannot login` otherwise',async() => {
          return ldapProvider.login('foo', 'baz', 0)
            .then(res => {
              expect(res).toBe('cannot login')
            })
            .catch(console.log)
        })
      })

      describe('#logout', () => {
        it('succeed logout on valid token', async() => {
          ldapProvider
            .login('foo', 'bar', 0)
            .catch(console.log)

          return ldapProvider.logout('foobartoken')
            .then((res) => {
              expect(res).toEqual(true)
              return res
            })
            .then(() => ldapProvider.getDataByToken('foobartoken'))
            .then(res => expect(res).toEqual(false))
            .catch(console.log)
        })

        it('return false on invalid token', async() => {
          return ldapProvider.logout('foobarinvalidtoken')
            .then((res: boolean) => expect(res).toBe(false))
        })
      })

      describe('#findGroupByUser', () => {
        it('succeed found group on valid user', async() =>
          ldapProvider.findGroupByUser('foo')
            .then((res: any) => {
              expect(res).toEqual('foo groups')
            })
            .catch(console.log),
        )

        it('return test on invalid user', async() =>
          ldapProvider.findGroupByUser('test')
            .then((res: any) => {
              expect(res).toEqual(false)
            })
            .catch(console.log),
        )

      })

      describe('#getDataByToken', () => {
        it('works correctly on valid token', async() => {
          const token = await ldapProvider.login('foo', 'bar', 100)
          expect(token).toEqual('foobartoken')
          const ldapData = await ldapProvider.getDataByToken('foobartoken')
          expect(ldapData).toMatchObject({ldapData: 'foo groups', ttl: 100})
          await ldapProvider.logout(token)
          const deleteLdapData = await ldapProvider.getDataByToken('foobartoken')
          expect(deleteLdapData).toEqual(false)
        })

        it('return false on invalid token', async() => {
          const ldapData = await ldapProvider.getDataByToken('invalidtoken')
          expect(ldapData).toBe(false)
        })
      })
    })

    // tslint:disable-next-line:no-empty
    describe('static', () => {})
  })
})
