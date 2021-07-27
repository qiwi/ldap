import {NestApplication} from '@nestjs/core'
import {Controller, Get, HttpStatus} from '@nestjs/common'
import {Test, TestingModule} from '@nestjs/testing'
import request from 'supertest'
import {SessionLdapProvider} from '@qiwi/ldap-common'
import {LdapGuard, LdapRoles, LDAP_PROVIDER, UseLdapGuard} from '../../main/ts'
import {testADProvider, testSessionProvider} from '../../test/stub/testLdap'

describe('nestjs-ldap-auth', () => {
  describe('index', () => {
    it('properly exposes its inners', () => {
      expect(LdapGuard).not.toBeUndefined()
    })
  })

  describe('guard works correctly', () => {
    let module: TestingModule
    let app: NestApplication

    const testLdapProvider = new SessionLdapProvider(
      testADProvider,
      testSessionProvider,
      'test',
    )

    @Controller('/')
    @UseLdapGuard()
    class CustomController {

      @Get('/private')
      @LdapRoles('Admin')
      getSmthPrivate(): Array<string> {
        return ['foo', 'bar']
      }

      @Get('/public')
      @LdapRoles('User', 'Admin')
      getSmthPublic(): Array<string> {
        return ['baz', 'qux']
      }

    }

    beforeAll(async() => {
      module = await Test.createTestingModule({
        providers: [{
          provide: LDAP_PROVIDER,
          useValue: testLdapProvider,
        }],
        controllers: [CustomController],
      }).compile()
      app = module.createNestApplication()
      await app.init()
    })

    describe('LdapGuard', () => {
      it('Admin should have access to both endpoints', async() => {
        await request(app.getHttpServer())
          .get('/public')
          .set({Authorization: 'tokenAdmin'})
          .expect(200, ['baz', 'qux'])

        await request(app.getHttpServer())
          .get('/private')
          .set({Authorization: 'tokenAdmin'})
          .expect(200, ['foo', 'bar'])
      })

      it('User should have access to public route only', async() => {
        await request(app.getHttpServer())
          .get('/public')
          .set({Authorization: 'tokenUser'})
          .expect(200, ['baz', 'qux'])

        await request(app.getHttpServer())
          .get('/private')
          .set({Authorization: 'tokenUser'})
          .expect(HttpStatus.FORBIDDEN)

      })

    })

  })
})
