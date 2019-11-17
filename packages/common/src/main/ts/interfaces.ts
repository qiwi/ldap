export interface ILdapProvider {
  login: (username: string, password: string) => string
  logout: (token: string) => boolean
  getDataByToken: (token: string) => any
}

export interface ISessionProvider {
  generateToken: ({ttl, userData, ldapData}: {ttl?: number, userData: {username: string, password: string}, ldapData: string}) => IToken
  refreshToken: (token: IToken) => IToken,
  revokeToken: (token: IToken) => boolean,
  appendData: ({token, data}: { token: IToken, data: any }) => IToken
  getDataByToken: (token: IToken) => any
}

export interface ILdapService {
  findUser: (username: string, cb: (err: any, res: any) => any) => void
  getGroupMembershipForUser: (username: string, cb: (err: any, res: any) => any) => void
  authenticate: (fullUserName: string, password: string, cb: (err: any, res: any) => any) => void
}

export type IToken = string
