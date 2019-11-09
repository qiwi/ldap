# nestjs-ldap-auth
Nestjs LDAP / AD auth helpers

## Install
```bash
yarn add nestjs-ldap-auth
npm add nestjs-ldap-auth
```

## Usage
```typescript
import {
  HasLdapGroup
} from 'nestjs-ldap-auth'

@Controller()
export class SomeController {
  @HasLdapGroup('admin')
  doSomething(@Body() body: any) {
    console.log(body)

    return {}
  }
}

// App.ts
@Module({
  imports: [...],
  controllers: [SomeController],
  providers: [...],
})
export class AppModule {}
```
