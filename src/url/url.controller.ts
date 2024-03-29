import { Body, Controller, Get, Param, Post, Req, Delete, Redirect } from '@nestjs/common';
import { UrlService } from './url.service';
import { URL } from './url/url.entity'

@Controller('url')
export class UrlController {

  constructor(private readonly urlsService: UrlService) {}

  @Post('create-url')
  async createShortURL(@Req() req, @Body() body: { originalUrl: string, shortUrl?: string }): Promise<string> {
    const userId = req['user'].sub;
    const { originalUrl, shortUrl } = body;

    return this.urlsService.createShortURL(originalUrl, userId, shortUrl);
  }

  @Get(':id/:shortUrl')
  @Redirect('302')
  async redirectToOriginalURL(@Req() req, @Param('id') id: number, @Param('shortUrl') shortUrl: string): Promise<{ url: string }> {
    const originalUrl = await this.urlsService.getOriginalURL(shortUrl,id);
    if (!originalUrl) {
      return { url: '/not-found' };
    }
    return { url: originalUrl };
  }

  @Get('users-urls')
  async getUserUrls(@Req() req): Promise<URL[]> {
    const userId = req['user'].sub;
    return this.urlsService.getUserUrls(userId);
  }

  @Get('users-custom-urls')
  async getUserCustomUrls(@Req() req): Promise<URL[]> {
    const userId = req['user'].sub;
    return this.urlsService.getUserCustomUrls(userId);
  }

  @Delete('delete/:shortUrl')
  async deleteUrl(@Req() req, @Param('shortUrl') shortUrl: string): Promise<void> {
    const userId = req['user'].sub;
    await this.urlsService.deleteUrl(userId, shortUrl);
  }

  @Get('url-counts')
  async getUserURLCounts(@Req() req: Request): Promise<{ total: number, custom: number, nonCustom: number,totalUrls: number,totalCutomsUrls:number,totalNonCustomUrls:number   }> {
    const userId = req['user'].sub;
    const { total, custom, nonCustom, totalUrls, totalCutomsUrls,totalNonCustomUrls } = await this.urlsService.getUserURLCounts(userId);
    return { total, custom, nonCustom, totalUrls, totalCutomsUrls,totalNonCustomUrls };
  }

  @Get('url-clicks')
  async getUrlClicks(@Req() req: Request): Promise<{ totalClicks: number, customUrlClicks: number, nonCustomUrlClicks: number }> {
    const userId = req['user'].sub;
    const isAdmin = req['user'].isAdmin;
    const { totalClicks, customUrlClicks, nonCustomUrlClicks } = await this.urlsService.getUrlClicks(userId,isAdmin);
    return { totalClicks, customUrlClicks, nonCustomUrlClicks };
  }
}
