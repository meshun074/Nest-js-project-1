import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EdituserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  last?: string;
}
