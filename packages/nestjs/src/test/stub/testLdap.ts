import {ISessionProvider} from '@qiwi/ldap-common'

export const testSessionProviderFactory = (): ISessionProvider => {
  const inMemoryStorage: {
    [key: string]: any
  } = {
    'tokenUser': ['User'],
    'tokenAdmin': ['Admin'],
  }

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
      return []
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

export const testSessionProvider = testSessionProviderFactory()

export const testADProvider = {
  findUser: (username: string, cb: (_: null, res: string) => void) => cb(null, username + ' found'),
  getGroupMembershipForUser: (username: string, cb: (_: null, res: string) => void) => {
    return cb(null, username + ' groups')
  },
  authenticate: (_: string, __: string, cb: (_: null, res: boolean) => void) => cb(null, true),
}
