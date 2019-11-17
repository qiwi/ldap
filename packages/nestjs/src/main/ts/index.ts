import {Injectable, Inject, CanActivate, ExecutionContext, SetMetadata} from '@nestjs/common'
import {ILdapProvider} from '@qiwi/ldap-common'
import {Reflector} from '@nestjs/core'
export const LDAP_PROVIDER = Symbol('ldap provider IoC ref')

@Injectable()
export class LdapGuard implements CanActivate {

  private readonly reflector: Reflector
  constructor(
    @Inject(LDAP_PROVIDER) private readonly ldapProvider: ILdapProvider,
  ) {
    this.reflector = new Reflector()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest()

    const token = req.get('Authorization')
    const userRoles = await this.ldapProvider.getDataByToken(token)
    const roles = this.reflector.get<string[]>('roles', context.getHandler())
    return userRoles.some((el: string) => roles.includes(el))
  }

}

export const LdapRoles = (...roles: string[]) => SetMetadata('roles', roles)
