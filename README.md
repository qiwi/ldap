# @qiwi/ldap

[![Maintainability](https://api.codeclimate.com/v1/badges/32171b1066fd735f2015/maintainability)](https://codeclimate.com/github/qiwi/ldap/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/32171b1066fd735f2015/test_coverage)](https://codeclimate.com/github/qiwi/ldap/test_coverage)
> Helpers for AD, LDAP interactions


## Status
🚧 Work in progress 🚧 / Experimental / Early access preview / 0.0.0-draft

## Usage
With [Nestjs](https://nestjs.com/):
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

## License
[MIT](./LICENSE)
