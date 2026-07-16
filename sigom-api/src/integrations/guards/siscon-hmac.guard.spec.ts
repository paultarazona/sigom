import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac } from 'crypto';
import { SisconHmacGuard } from './siscon-hmac.guard';

const secret = 'test-integration-secret';
const body = JSON.stringify({ incident: { externalId: '123' } });
const timestamp = new Date().toISOString();
const requestId = '550e8400-e29b-41d4-a716-446655440000';
const path = '/api/v1/integrations/siscon/work-orders';

function context(headers: Record<string, string>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'POST', originalUrl: path, rawBody: Buffer.from(body), headers }),
    }),
  } as unknown as ExecutionContext;
}

describe('SisconHmacGuard', () => {
  const config = {
    get: jest.fn(
      (key: string, fallback?: string) =>
        ({
          SISCON_HMAC_SECRET: secret,
          SISCON_HMAC_MAX_AGE_SECONDS: 300,
        })[key] ?? fallback,
    ),
  } as unknown as ConfigService;
  const guard = new SisconHmacGuard(config);

  it('accepts a valid canonical signature', () => {
    const bodyHash = createHash('sha256').update(body).digest('hex');
    const signature = createHmac('sha256', secret)
      .update(`POST\n${path}\n${timestamp}\n${requestId}\n${bodyHash}`)
      .digest('hex');

    expect(
      guard.canActivate(
        context({
          authorization: `HMAC ${signature}`,
          'x-siscon-timestamp': timestamp,
          'x-request-id': requestId,
        }),
      ),
    ).toBe(true);
  });

  it('rejects an invalid signature', () => {
    expect(() =>
      guard.canActivate(
        context({
          authorization: 'HMAC invalid',
          'x-siscon-timestamp': timestamp,
          'x-request-id': requestId,
        }),
      ),
    ).toThrow(UnauthorizedException);
  });
});
