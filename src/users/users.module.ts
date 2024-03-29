import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { URL } from 'src/url/url/url.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,URL])],
  providers:[UsersService],
  controllers: [UsersController],
  exports:[UsersService]
})
export class UsersModule {}
