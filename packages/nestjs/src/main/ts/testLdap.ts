import {ldapClientFactory} from '@qiwi/ldap-common'

export const activeDirectoryConfig = {
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

export type IToken = string

export interface ISessionProvider {
  generateToken: ({ttl, userData, ldapData}: {ttl?: number, userData: {username: string, password: string}, ldapData: string}) => IToken
  refreshToken: (token: IToken) => IToken,
  revokeToken: (token: IToken) => boolean,
  appendData: ({token, data}: { token: IToken, data: any }) => IToken
  getDataByToken: (token: IToken) => any
}

export const testSessionProviderFactory = (): ISessionProvider => {
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

export const testSessionProvider = testSessionProviderFactory()

export const testADProvider = {
  findUser: (username: string, cb: (_: null, res: string) => void) => cb(null, username + ' found'),
  getGroupMembershipForUser: (username: string, cb: (_: null, res: string) => void) => {
    return cb(null, username + ' groups')
  },
  authenticate: (_: string, __: string, cb: (_: null, res: boolean) => void) => cb(null, true),
}

export const ldapClient = ldapClientFactory({
  sessionProvider: testSessionProvider,
  ldapConfig: activeDirectoryConfig,
  ldapProvider: testADProvider,
})
