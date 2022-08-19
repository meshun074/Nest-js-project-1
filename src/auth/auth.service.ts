import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    //generate password
    const hash = await argon.hash(dto.password);

    try {
      //save new user in the database
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          firstName: dto.firstname,
          lastName: dto.lastname,
        },
      });
      //return saved user
      return this.Token(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials exist');
        }
      }
      throw error;
    }
  }
  // find user by email
  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    //if user not found throw an exception
    if (!user) {
      throw new ForbiddenException('Incorrect credentials');
    }

    //compare password
    const pwcompare = await argon.verify(user.hash, dto.password);

    if (!pwcompare) {
      throw new ForbiddenException('Incorrect Credentials');
    }

    return this.Token(user.id, user.email);
  }

  async Token(
    userid: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const data = {
      sub: userid,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(data, {
      expiresIn: '15m',
      secret: secret,
    });
    return { access_token: token };
  }
}
