import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private readonly logger = new Logger(RedisService.name);
  private enabled = false;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.config.get('REDIS_URL');
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not set. Real-time pub/sub disabled. Socket.IO works in single-instance mode.');
      return;
    }
    try {
      this.client = new Redis(redisUrl, {
        retryStrategy: (times) => Math.min(times * 50, 2000),
        maxRetriesPerRequest: 3,
      });
      this.enabled = true;
      this.logger.log('Redis connected');
    } catch (err: any) {
      this.logger.error('Redis connection failed:', err.message);
    }
  }

  onModuleDestroy() {
    if (this.client) this.client.disconnect();
  }

  isEnabled(): boolean { return this.enabled; }
  getClient(): Redis | null { return this.client; }

  async publish(channel: string, message: string): Promise<void> {
    if (!this.client) return;
    await this.client.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const redisUrl = this.config.get<string>('REDIS_URL');
    if (!this.client || !redisUrl) return;
    const subscriber = new Redis(redisUrl);
    await subscriber.subscribe(channel);
    subscriber.on('message', (ch, msg) => { if (ch === channel) callback(msg); });
  }
}
