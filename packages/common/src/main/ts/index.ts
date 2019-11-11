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

interface ISessionProvider {
  login: (username: string, password: string) => IToken,
  logout: (token: IToken) => void,
  getSelfProfile: (token: IToken) => { roles: string[] }
}

type IToken = string

export const ldapClientFactory = (
  ldapConfig: ILdapConfig,
  sessionProvider: ISessionProvider,
) => {
  const ad = new ActiveDirectory(ldapConfig.instanceConfig)

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

  async function login(username: string, password: string) {
    const isLoginSuccessful = await checkCred(username, password)
    if (!isLoginSuccessful) {
      return 'cannot login'
    }

    return sessionProvider.login(username, password)
  }

  function logout(token: IToken) {
    return sessionProvider.logout(token)
  }

  function getSelfProfile(token: IToken) {
    return sessionProvider.getSelfProfile(token)
  }

  return {
    checkCred,
    login,
    logout,
    getSelfProfile,
  }
}
