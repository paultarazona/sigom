import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutboxStatus, Prisma } from '@prisma/client';
import { createHmac, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OutboxService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxService.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const intervalMs = Number(this.config.get('SISCON_OUTBOX_INTERVAL_MS', 10_000));
    this.timer = setInterval(() => void this.deliverPending(), intervalMs);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async deliverPending() {
    if (this.running) return;
    this.running = true;
    try {
      const now = new Date();
      const leaseMs = Number(this.config.get('SISCON_OUTBOX_LEASE_MS', 60_000));
      await this.prisma.integrationOutbox.updateMany({
        where: {
          status: OutboxStatus.PROCESSING,
          lockedAt: { lt: new Date(now.getTime() - leaseMs) },
        },
        data: { status: OutboxStatus.PENDING, lockedAt: null, lockToken: null, nextAttemptAt: now },
      });

      const pending = await this.prisma.integrationOutbox.findMany({
        where: { status: OutboxStatus.PENDING, nextAttemptAt: { lte: now } },
        orderBy: { nextAttemptAt: 'asc' },
        take: 10,
      });
      for (const event of pending) await this.claimAndDeliver(event.id);
    } finally {
      this.running = false;
    }
  }

  private async claimAndDeliver(id: string) {
    const lockToken = randomUUID();
    const claim = await this.prisma.integrationOutbox.updateMany({
      where: { id, status: OutboxStatus.PENDING, nextAttemptAt: { lte: new Date() } },
      data: { status: OutboxStatus.PROCESSING, lockedAt: new Date(), lockToken },
    });
    if (claim.count === 0) return;

    const event = await this.prisma.integrationOutbox.findUniqueOrThrow({ where: { id } });
    try {
      await this.send(event.id, event.payload);
      await this.prisma.integrationOutbox.update({
        where: { id },
        data: { status: OutboxStatus.DELIVERED, deliveredAt: new Date(), lockedAt: null, lockToken: null },
      });
    } catch (error) {
      const attempts = event.attemptCount + 1;
      const maxRetries = Number(this.config.get('SISCON_MAX_RETRIES', 8));
      const message = error instanceof Error ? error.message.slice(0, 1000) : 'Unknown delivery error';
      await this.prisma.integrationOutbox.update({
        where: { id },
        data:
          attempts >= maxRetries
            ? { status: OutboxStatus.DEAD, attemptCount: attempts, lockedAt: null, lockToken: null, lastError: message }
            : {
                status: OutboxStatus.PENDING,
                attemptCount: attempts,
                nextAttemptAt: new Date(Date.now() + this.backoffMs(attempts)),
                lockedAt: null,
                lockToken: null,
                lastError: message,
              },
      });
      this.logger.warn(`SISCON outbox event ${id} delivery failed: ${message}`);
    }
  }

  private async send(eventId: string, payload: Prisma.JsonValue) {
    const url = this.config.get<string>('SISCON_API_URL');
    const secret = this.config.get<string>('SISCON_OUTBOUND_HMAC_SECRET');
    if (!url || !secret) throw new Error('SISCON outbound integration is not configured');

    const body = JSON.stringify(payload);
    const timestamp = new Date().toISOString();
    const signature = createHmac('sha256', secret)
      .update(`POST\n${url}\n${timestamp}\n${eventId}\n${body}`)
      .digest('hex');
    const timeoutMs = Number(this.config.get('SISCON_TIMEOUT_MS', 5_000));
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `HMAC ${signature}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': eventId,
        'X-Request-Id': eventId,
        'X-SISCON-Timestamp': timestamp,
      },
      body,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) throw new Error(`SISCON responded with HTTP ${response.status}`);
  }

  private backoffMs(attempt: number) {
    const capped = Math.min(attempt, 8);
    return 2 ** capped * 1_000 + Math.floor(Math.random() * 1_000);
  }
}
