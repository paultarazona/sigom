import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

function extractSessionCookie(request: { headers?: { cookie?: string } }) {
  return (
    request.headers?.cookie
      ?.split('; ')
      .find((cookie) => cookie.startsWith('sigom_session='))
      ?.slice('sigom_session='.length) ?? null
  );
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET debe estar configurado.');

    super({
      jwtFromRequest: extractSessionCookie,
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no autorizado o inactivo.');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
