import { IsDateString, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({
    message: 'The name must have a value',
  })
  name: string;

  @Length(5, 255)
  description: string;

  @IsDateString()
  when: string;

  @IsNotEmpty()
  @Length(5, 255)
  address: string;
}
