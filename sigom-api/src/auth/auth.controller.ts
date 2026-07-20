import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const session = await this.authService.login(loginDto);
    response.cookie('sigom_session', session.data.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000,
      path: '/',
    });
    return { data: { user: session.data.user }, message: session.message };
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('sigom_session', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return { message: 'Sesión cerrada.' };
  }
}
