import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common'
import {Reflector} from '@nestjs/core'

@Injectable()
export class LdapGuard implements CanActivate {

  // @ts-ignore
  constructor(private readonly reflector: Reflector) {}
  // @ts-ignore
  canActivate(context: ExecutionContext): boolean {
    console.log('HasLdapGroup'.toUpperCase())
    const roles = this.reflector.get<string[]>('roles', context.getClass())

    console.log('roles', roles)
    return false
    // if (!roles) {
    //   return true
    // }
    //
    // const request = context.switchToHttp().getRequest()
    // const user = request.user
    // const hasRole = () => user.roles.some((role: string) => roles.includes(role))
    // return user && user.roles && hasRole()
  }

}
