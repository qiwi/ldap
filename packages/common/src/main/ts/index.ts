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
  generateToken: ({ttl, data}: {ttl: number, data: any}) => IToken
  refreshToken: (token: IToken) => IToken,
  revokeToken: (token: IToken) => boolean,
  appendData: ({token: data}: { token: IToken, data: any }) => IToken
}

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

  async function login(username: string, password: string, ttl: number) {
    const isLoginSuccessful = await checkCred(username, password)
    if (!isLoginSuccessful) {
      return 'cannot login'
    }

    return sessionProvider.generateToken({
      ttl,
      data: {username, password},
    })
  }

  function logout(token: IToken) {
    return sessionProvider.revokeToken(token)
  }

  return {
    checkCred,
    login,
    logout,
  }
}
