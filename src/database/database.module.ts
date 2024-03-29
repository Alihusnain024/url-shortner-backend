import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { URL } from '../url/url/url.entity';
import { User } from 'src/users/user.entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'url_shortener',
      entities: [User,URL],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
