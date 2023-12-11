import { IsEmail, IsString, Length } from 'class-validator';

export default class CreateUserDto {
  @IsString()
  @Length(4, 20)
  username: string;

  @IsString()
  @Length(6)
  password: string;

  @IsString()
  @Length(6)
  passwordConfirmation: string;

  @IsString()
  @Length(2)
  firstName: string;

  @IsString()
  @Length(2)
  lastName: string;

  @IsEmail()
  email: string;
}
