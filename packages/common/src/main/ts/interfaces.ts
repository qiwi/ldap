export interface ILdapProvider {
  login: (username: string, password: string, ttl: number) => Promise<IToken>
  logout: (token: string) => Promise<boolean>
  getDataByToken: (token: string) => Promise<any>
}

export interface ISessionProvider {
  generateToken: ({ttl, userData, ldapData}: {ttl?: number, userData: {username: string, password: string}, ldapData: string}) => Promise<IToken>
  refreshToken: (token: IToken) => Promise<IToken>,
  revokeToken: (token: IToken) => Promise<boolean>,
  appendData: ({token, data}: { token: IToken, data: any }) => Promise<boolean>
  getDataByToken: (token: IToken) => Promise<any>
}

export interface ILdapService {
  findUser: (username: string, cb: (err: any, res: any) => any) => void
  getGroupMembershipForUser: (username: string, cb: (err: any, res: any) => any) => void
  authenticate: (fullUserName: string, password: string, cb: (err: any, res: any) => any) => void
}

export type IToken = string
