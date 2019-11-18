import {ILdapProvider, ILdapService, ISessionProvider, IToken} from './interfaces'

export class SessionLdapProvider implements ILdapProvider{

  constructor(
    private readonly ldapService: ILdapService,
    private readonly sessionProvider: ISessionProvider,
    private readonly userPostfix: string,
  ) {}

  checkCred(login: string, password: string) {
    const fullUserName = login + this.userPostfix
    return new Promise(resolve => {
      this.ldapService.authenticate(fullUserName, password, (err: any, result: any) => {
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

  findGroupByUser(username: string): any {
    return new Promise((resolve => {
      this.ldapService.getGroupMembershipForUser(username, (_: any, res: any) => {
        resolve(res)
      })
    }))
  }

  async login(username: string, password: string, ttl: number) {
    const isLoginSuccessful = await this.checkCred(username, password)

    if (!isLoginSuccessful) {
      return 'cannot login'
    }

    const userGroups = await this.findGroupByUser(username)
    return this.sessionProvider.generateToken({
      ttl,
      userData: {username, password},
      ldapData: userGroups,
    })
  }

  async logout(token: IToken) {
    return this.sessionProvider.revokeToken(token)
  }

  async getDataByToken(token: IToken) {
    return this.sessionProvider.getDataByToken(token)
  }

}
