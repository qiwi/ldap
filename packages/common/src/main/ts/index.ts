// @ts-ignore
import ActiveDirectory from 'activedirectory'

interface ILdapConfig {
  instanceConfig: IInstanceLdapConfig
  userPostfix: string
}

interface IInstanceLdapConfig {
  url: string,
  baseDN: string,
  tlsOptions?: {
    rejectUnauthorized: boolean
  }
}

type IToken = string

interface ISessionProvider {
  generateToken: ({ttl, userData, ldapData}: {ttl?: number, userData: {username: string, password: string}, ldapData: string}) => IToken
  refreshToken: (token: IToken) => IToken,
  revokeToken: (token: IToken) => boolean,
  appendData: ({token, data}: { token: IToken, data: any }) => IToken
  getDataByToken: (token: IToken) => any
}

interface ILdapProvider {
  findUser: (username: string, cb: (err: any, res: any) => any) => void
  getGroupMembershipForUser: (username: string, cb: (err: any, res: any) => any) => void
  authenticate: (fullUserName: string, password: string, cb: (err: any, res: any) => any) => void
}

// const ad = new ldapProvider(ldapConfig.instanceConfig) => и передавай инстанс

export const ldapClientFactory = ({
  ldapConfig,
  ldapProvider,
  sessionProvider,
}: {
  ldapConfig: ILdapConfig,
  ldapProvider: ILdapProvider
  sessionProvider: ISessionProvider
}) => {

  function findUser(username: string) {
    return new Promise((resolve => {
      ldapProvider.findUser(username, (_: any, res: any) => {
        resolve(res)
      })
    }))
  }

  function findGroupByUser(username: string): any {
    return new Promise((resolve => {
      ldapProvider.getGroupMembershipForUser(username, (_: any, res: any) => {
        resolve(res)
      })
    }))
  }

  function checkCred(login: string, password: string) {
    const fullUserName = login + ldapConfig.userPostfix
    return new Promise(resolve => {
      ldapProvider.authenticate(fullUserName, password, (err: any, result: any) => {
        if (err) {
          resolve({reasonText: err})
        }

        if (!result) {
          resolve({reasonText: 'Unauthenticated'})
        }

        return resolve({login, result})
      })
    })
  }

  async function login(username: string, password: string, ttl: number) {
    const isLoginSuccessful = await checkCred(username, password)

    if (!isLoginSuccessful) {
      return 'cannot login'
    }

    const userGroups = await findGroupByUser(username)
    return sessionProvider.generateToken({
      ttl,
      userData: {username, password},
      ldapData: userGroups,
    })
  }

  function logout(token: IToken) {
    return new Promise(resolve => {
      resolve(sessionProvider.revokeToken(token))
    })
  }

  function getDataByToken(token: IToken): any {
    return sessionProvider.getDataByToken(token)
  }

  return {
    findGroupByUser,
    findUser,
    checkCred,
    login,
    logout,
    getDataByToken,
  }
}
