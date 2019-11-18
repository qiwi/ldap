import {NestApplication} from '@nestjs/core'
import {Controller, Get, HttpStatus} from '@nestjs/common'
import {Test, TestingModule} from '@nestjs/testing'
import request from 'supertest'
import {SessionLdapProvider} from '@qiwi/ldap-common'
import {LdapGuard, LdapRoles, LDAP_PROVIDER, UseLdapGuard} from '../../main/ts'
import {testADProvider, testSessionProvider} from '../../test/stub/testLdap'

describe('@qiwi/ldap-common', () => {
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

    @Controller('cats')
    @UseLdapGuard()
    class CustomController {

      @Get()
      @LdapRoles('Admin', 'User')
      findAll(): string {
        return 'This action returns all cats'
      }

    }

    @Controller('forbidden')
    @UseLdapGuard()
    class ForbiddenController {

      @Get()
      @LdapRoles('Admin')
      findAll(): string {
        return 'This action returns all cats'
      }

    }

    beforeAll(async() => {
      module = await Test.createTestingModule({
        providers: [{
          provide: LDAP_PROVIDER,
          useValue: testLdapProvider,
        }],
        controllers: [CustomController, ForbiddenController],
      }).compile()
      app = module.createNestApplication()
      await app.init()
    })

    describe('LdapGuard', () => {
      it('should return string correctly', async() => {
        return request(app.getHttpServer())
          .get('/cats')
          .set({Authorization: 'token1'})
          .expect('This action returns all cats')
      })

      it('should return 403 status', async() => {
        return request(app.getHttpServer())
          .get('/forbidden')
          .set({Authorization: 'token1'})
          .expect(HttpStatus.FORBIDDEN)

      })

    })

  })
})
