import { Controller, Post, Body, Req, UseGuards, Get, Redirect, Param, HttpException, HttpStatus, Delete, UnauthorizedException, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get('profile')
  async getUserProfile(@Req() req: Request) {
    const userId = req['user'].sub;
    return this.usersService.getUserDetailsById(userId);
  }

  @Patch('profile')
  async updateUserProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = req['user'].sub;
    return this.usersService.updateUserProfile(userId, updateUserDto);
  }

  @Get('dashboard')
  async getDashboardData() {
    const userCount = await this.usersService.getUserCount();
    const users = await this.usersService.getAllUsers();
    return { userCount, users };
  }

  @Delete(':userId')
  async deleteUser(@Param('userId') userId: number, @Req() req: Request) {
    const currentUser = req['user'].sub;
    const isAdmin = req['user'].isAdmin
    if (!currentUser || !isAdmin) {
      throw new UnauthorizedException('Only admin user can delete users.');
    }

    return this.usersService.deleteUser(userId);
  }

}
