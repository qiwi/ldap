# @qiwi/ldap
Helpers for AD, LDAP interactions

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
