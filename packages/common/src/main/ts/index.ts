// @ts-ignore
import ActiveDirectory from 'activedirectory'
import {ISessionProvider, ILdapService, IToken, ILdapProvider} from './interfaces'
import {SessionLdapProvider} from './SessionLdapProvider'
export interface ILdapConfig {
  instanceConfig: IInstanceLdapConfig
  userPostfix: string
}

export interface IInstanceLdapConfig {
  url: string,
  baseDN: string,
  tlsOptions?: {
    rejectUnauthorized: boolean
  }
}

export interface ILdapProviderFactory {
  ldapConfig: ILdapConfig,
  ldapProvider: ILdapService
  sessionProvider: ISessionProvider
}
// const ad = new ldapProvider(ldapConfig.instanceConfig) => и передавай инстанс

const ldapClientFactory = ({
  ldapConfig,
  ldapProvider,
  sessionProvider,
}: ILdapProviderFactory): ILdapProvider => {

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

  function logout(token: IToken): Promise<boolean> {
    return new Promise(resolve => {
      resolve(sessionProvider.revokeToken(token))
    })
  }

  function getDataByToken(token: IToken): Promise<any> {
    return new Promise(resolve =>
      resolve(sessionProvider.getDataByToken(token)),
    )
  }

  return {
    login,
    logout,
    getDataByToken,
  }
}

export {
  ISessionProvider,
  ILdapService,
  IToken,
  ILdapProvider,
  ldapClientFactory,
  SessionLdapProvider,
}
