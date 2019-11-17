import {Injectable, Inject, CanActivate, ExecutionContext, SetMetadata} from '@nestjs/common'
import {ILdapProvider} from '@qiwi/ldap-common'
import {Reflector} from '@nestjs/core'

@Injectable()
export class LdapGuard implements CanActivate {

  private readonly reflector: Reflector
  constructor(
    @Inject(LDAP_PROVIDER) private readonly ldapProvider: ILdapProvider,
  ) {
    this.reflector = new Reflector()
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler())
    return !roles

    // const request = context.switchToHttp().getRequest()
    // const user = request.user
    // const hasRole = () => user.roles.some((role: string) => roles.includes(role))
    // return user && user.roles && hasRole()
  }

}

export const LDAP_PROVIDER = Symbol('ldap provider IoC ref')
export const LdapRoles = (...roles: string[]) => SetMetadata('roles', roles)
