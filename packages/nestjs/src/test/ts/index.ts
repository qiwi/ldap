import {LdapGuard, LdapRoles, LDAP_PROVIDER} from '../../main/ts'
import {Test, TestingModule} from '@nestjs/testing'
import {NestApplication} from '@nestjs/core'
import {Controller, Get, HttpStatus, UseGuards} from '@nestjs/common'
import request from 'supertest'
import {ldapClient} from '../../main/ts/testLdap'

describe('@qiwi/ldap-common', () => {
  describe('index', () => {
    it('properly exposes its inners', () => {
      expect(LdapGuard).not.toBeUndefined()
    })
  })

  describe('guard works correctly', () => {
    let module: TestingModule
    // let controller: CustomController
    let app: NestApplication

    @Controller('cats')

    @UseGuards(LdapGuard)
    class CustomController {

      @Get()
      @LdapRoles('admin', 'user')
      findAll(): string {
        return 'This action returns all cats'
      }

    }

    beforeAll(async() => {
      module = await Test.createTestingModule({
        providers: [{
          provide: LDAP_PROVIDER,
          useValue: new LdapGuard(ldapClient),
        }],
        controllers: [CustomController],
      }).compile()
      app = module.createNestApplication()
      await app.init()
    })

    describe('CatsController', () => {
      describe('findAll', () => {
        it('should return an array of cats', async() => {
          return request(app.getHttpServer())
            .get('/cats')
            .expect(HttpStatus.FORBIDDEN)

        })
      })
    })

  })
})
