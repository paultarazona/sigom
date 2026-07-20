import { Response } from 'express';
import { UserRole } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  const cookie = jest.fn();
  const clearCookie = jest.fn();
  const authService = {
    login: jest.fn(),
  } as unknown as AuthService;
  const controller = new AuthController(authService);
  const response = {
    cookie,
    clearCookie,
  } as unknown as Response;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  it('stores the access token in an HttpOnly cookie and omits it from the body', async () => {
    const user = {
      id: 'user-1',
      email: 'admin@enosa.test',
      firstName: 'Admin',
      lastName: 'ENOSA',
      role: UserRole.ADMIN,
    };
    jest.spyOn(authService, 'login').mockResolvedValue({
      data: { accessToken: 'signed-token', user },
      message: 'Inicio de sesión exitoso.',
    });

    const result = await controller.login({ email: user.email, password: 'password' }, response);

    expect(cookie).toHaveBeenCalledWith(
      'sigom_session',
      'signed-token',
      expect.objectContaining({ httpOnly: true, sameSite: 'strict', secure: false, path: '/' }),
    );
    expect(result).toEqual({ data: { user }, message: 'Inicio de sesión exitoso.' });
  });

  it('clears the session cookie on logout', () => {
    const result = controller.logout(response);

    expect(clearCookie).toHaveBeenCalledWith(
      'sigom_session',
      expect.objectContaining({ httpOnly: true, sameSite: 'strict', secure: false, path: '/' }),
    );
    expect(result).toEqual({ message: 'Sesión cerrada.' });
  });
});
