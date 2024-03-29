import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { AuthMiddleware } from './auth/auth/auth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { UrlModule } from './url/url.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DatabaseModule,
    JwtModule.register({}),
    UrlModule,
  ],
  providers:[],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'url/:id/:shortUrl', method: RequestMethod.GET },

      )
      .forRoutes('*');
  }
}
