import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity/user.entity';
import { UsersService } from '../users/users.service';
import { URL } from 'src/url/url/url.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,URL]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class SharedModule {}
