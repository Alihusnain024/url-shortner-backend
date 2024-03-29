import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity/user.entity';
import { UpdateUserDto } from './dto/update-user';
import { URL } from 'src/url/url/url.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(URL)
    private readonly  urlRepository: Repository<URL>

  ) {}

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async createUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async getUserDetailsById(userId) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...userDetails } = user;
    return userDetails;
  }

  async updateUserProfile(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async getUserCount(): Promise<number> {
    return this.userRepository.count({ where: { isAdmin: false } });
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({ where: { isAdmin: false } });
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    await this.urlRepository.delete({ user: user });

    await this.userRepository.remove(user);
  }


  async getUser(userId: number): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId }});
  }

}
