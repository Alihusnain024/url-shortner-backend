import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { URL } from './url/url.entity';
import { User } from 'src/users/user.entity/user.entity';

@Module({
  imports: [
  TypeOrmModule.forFeature([URL,User])],
  controllers: [UrlController],
  providers: [UrlService],
})
export class UrlModule {}
