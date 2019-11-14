import {LdapGuard} from '../../main/ts'
import {Test, TestingModule} from '@nestjs/testing'
import {NestApplication} from '@nestjs/core'
import {Controller, Get, UseGuards, SetMetadata} from '@nestjs/common'
import request from 'supertest'

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
      @SetMetadata('roles', ['admin'])
      findAll(): string {
        return 'This action returns all cats'
      }

    }

    beforeAll(async() => {
      module = await Test.createTestingModule({
        providers: [],
        controllers: [CustomController],
      }).compile()
      app = module.createNestApplication()
      // app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

      await app.init()

      controller = module.get(CustomController)
    })

    describe('CatsController', () => {
      describe('findAll', () => {
        it('should return an array of cats', async() => {
          return request(app.getHttpServer())
            .get('/cats')

        })
      })
    })

  })
})
