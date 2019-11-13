// @ts-ignore
import ActiveDirectory from 'activedirectory'

interface ILdapConfig {
  instanceConfig: {
    url: string,
    baseDN: string,
    tlsOptions?: {
      rejectUnauthorized: boolean
    }
  }
  userPostfix: string
}

type IToken = string

interface ISessionProvider {
  generateToken: ({ttl, userData, ldapData}: {ttl?: number, userData: {username: string, password: string}, ldapData: string}) => IToken
  refreshToken: (token: IToken) => IToken,
  revokeToken: (token: IToken) => boolean,
  appendData: ({token, data}: { token: IToken, data: any }) => IToken
  getDataByToken: (token: IToken) => any
}

export const ldapClientFactory = (
  ldapConfig: ILdapConfig,
  sessionProvider: ISessionProvider,
  AD?: any,
) => {
  const ad = AD || new ActiveDirectory(ldapConfig.instanceConfig)

  function findUser(username: string) {
    return new Promise((resolve => {
      ad.findUser(username, (_: any, res: any) => {
        resolve(res)
      })
    }))
  }

  function findGroupByUser(username: string): any {
    return new Promise((resolve => {
      ad.getGroupMembershipForUser(username, (_: any, res: any) => {
        resolve(res)
      })
    }))
  }

  function checkCred(login: string, password: string) {
    const fullUserName = login + ldapConfig.userPostfix
    return new Promise(resolve => {
      ad.authenticate(fullUserName, password, (err: any, result: any) => {
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
