import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const session = await this.authService.login(loginDto);
    response.cookie('sigom_session', session.data.accessToken, {
      ...baseCookieOptions(),
      maxAge: 8 * 60 * 60 * 1000,
    });
    return { data: { user: session.data.user }, message: session.message };
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('sigom_session', baseCookieOptions());
    return { message: 'Sesión cerrada.' };
  }
}
