import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Post,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import CreateUserDto from './input/create-user.dto';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';

@Controller('users')
@SerializeOptions({ strategy: 'excludeAll' })
export default class UsersController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body(ValidationPipe) userDto: CreateUserDto) {
    if (userDto.password !== userDto.passwordConfirmation) {
      throw new BadRequestException(['Passwords are not identical']);
    }

    const existingUser = await this.checkUserExistence(
      userDto.username,
      userDto.email,
    );

    if (existingUser) {
      throw new BadRequestException(['username or email is already used']);
    }
    const user = new User();
    user.username = userDto.username;
    user.email = userDto.email;
    user.firstName = userDto.firstName;
    user.lastName = userDto.lastName;
    user.password = await this.authService.hashPassword(userDto.password);

    return {
      ...(await this.userRepo.save(user)),
      token: this.authService.getTokenForUser(user),
    };
  }

  private async checkUserExistence(username: string, email: string) {
    return await this.userRepo.findOne({
      where: [{ username: username }, { email: email }],
    });
  }
}
