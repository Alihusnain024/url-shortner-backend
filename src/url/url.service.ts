import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity/user.entity';
import { URL } from './url/url.entity'
import * as crypto from 'crypto';


@Injectable()
export class UrlService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(URL)
    private readonly urlRepository: Repository<URL>

  ) {}

  async createShortURL(originalUrl: string, userId: number, shortUrl?: string): Promise<string> {
    if (!originalUrl) {
      throw new BadRequestException('Original URL is required');
    }

    originalUrl = originalUrl.trim();

      const urlRegExp = /^(https?:\/\/)?([\w-]+\.)*([\w-]+)(\.[a-zA-Z]{2,})(:\d{1,5})?(\/\S*)?$/;

      if (!urlRegExp.test(originalUrl)) {
          throw new BadRequestException('Invalid URL format');
      }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    if (shortUrl) {
      const existingURL = await this.urlRepository.findOne({ where: {user,originalUrl, isCustom:true } });
      if (existingURL) {
        throw new ConflictException('Short URL is already in use');
      }
      const newURL = this.urlRepository.create({ originalUrl, shortUrl, user, isCustom: true });
      await this.urlRepository.save(newURL);

      return shortUrl;
    } else {
      const existingURL = await this.urlRepository.findOne({ where: { user, originalUrl,isCustom: false } });
      if (existingURL) {
        throw new ConflictException('User already has a shortened URL for this original URL');
      }

      const generatedShortUrl = this.generateShortURL(originalUrl);

      const newURL = this.urlRepository.create({ originalUrl, shortUrl: generatedShortUrl, user });
      await this.urlRepository.save(newURL);

      return generatedShortUrl;
    }
  }

  async getOriginalURL(shortUrl: string, userId: number): Promise<string | null> {
    const url = await this.urlRepository.findOne({ where: { shortUrl, user: { id: userId } } });
    if (!url) {
        throw new NotFoundException('URL not found');
    }
    url.clickCount += 1;
    await this.urlRepository.save(url);
    return url.originalUrl;
}

  async getUserUrls(userId: number): Promise<URL[]> {
    const user = await this.getUserWithUrls(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.urlRepository.find({ where: { user, isCustom: false } });
  }

  async getUserCustomUrls(userId: number): Promise<URL[]> {
    const user = await this.getUserWithUrls(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.urlRepository.find({ where: { user, isCustom: true } });
  }

  private generateShortURL(originalUrl: string): string {
    const hash = crypto.createHash('sha1').update(originalUrl).digest('hex');
    return hash.substring(0, 8);
  }

  async deleteUrl(userId: number, shortUrl: string): Promise<void> {
    await this.urlRepository.delete({ user: { id: userId }, shortUrl });
  }

  async getUserURLCounts(userId: number): Promise<{ total: number, custom: number, nonCustom: number,totalUrls: number,totalCutomsUrls:number,totalNonCustomUrls:number  }> {
    const user = await this.getUserWithUrls(userId);
    const total = await this.urlRepository.count({ where: { user }});
    const custom = await this.urlRepository.count({ where: { user, isCustom: true } });
    const totalUrls = await this.urlRepository.count();
    const totalCutomsUrls = await this.urlRepository.count({ where: { isCustom: true } });
    const totalNonCustomUrls = totalUrls - totalCutomsUrls;
    const nonCustom = total - custom;
    return { total, custom, nonCustom, totalUrls, totalCutomsUrls,totalNonCustomUrls };
  }

  async getUrlClicks(userId: number, isAdmin: boolean): Promise<{ totalClicks: number, customUrlClicks: number, nonCustomUrlClicks: number }> {
    let userUrls;

    if (isAdmin) {
        userUrls = await this.urlRepository.find();
    } else {
        userUrls = await this.urlRepository.find({ where: { user: { id: userId } }, relations: ['user'] });
    }

    let totalClicks = 0;
    let customUrlClicks = 0;
    let nonCustomUrlClicks = 0;

    userUrls.forEach(url => {
        totalClicks += url.clickCount;
        if (url.isCustom) {
            customUrlClicks += url.clickCount;
        } else {
            nonCustomUrlClicks += url.clickCount;
        }
    });

    return { totalClicks, customUrlClicks, nonCustomUrlClicks };
}

  async getUserWithUrls(userId: number): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId }, relations: ['urls'] });
  }

}
