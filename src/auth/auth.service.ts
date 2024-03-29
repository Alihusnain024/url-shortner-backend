import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity/user.entity';
import { RegisterDto } from '../auth/dto/register/register';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id , isAdmin: user.isAdmin };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerUser(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersService.findByUsername(registerDto.username);
    if (existingUser) {
      throw new Error('Username is already taken use different username');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = new User();
    newUser.username = registerDto.username;
    newUser.password = hashedPassword;
    newUser.firstName = registerDto.firstName;
    newUser.lastName = registerDto.lastName;
    newUser.email = registerDto.email;

    return this.usersService.createUser(newUser);
  }
}
