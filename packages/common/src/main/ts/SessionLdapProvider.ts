import {ILdapProvider, ILdapService, ISessionProvider, IToken} from './interfaces'

export class SessionLdapProvider implements ILdapProvider{
  constructor(
    private readonly ldapService: ILdapService,
    private readonly sessionProvider: ISessionProvider,
  ) {}

  login(username: string, password: string) {}
  logout(token: IToken) {}
  getDataByToken(token: IToken) {}
}

export class KeycloakLdapProvider implements ILdapProvider{
  constructor(
    private readonly ldapService: ILdapService,
    private readonly sessionProvider: ISessionProvider,
  ) {}

  login(username: string, password: string) {}
  logout(token: IToken) {}
  getDataByToken(token: IToken) {}
}

export class CommonAuthLdapProvider implements ILdapProvider{
  constructor(
    private readonly ldapService: ILdapService,
    private readonly sessionProvider: ISessionProvider,
  ) {}

  login(username: string, password: string) {}
  logout(token: IToken) {}
  getDataByToken(token: IToken) {}
}
