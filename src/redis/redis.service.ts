import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('redis.host') || process.env.REDIS_HOST || 'localhost';
    const port = this.configService.get<number>('redis.port') || parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = this.configService.get<string>('redis.password') || process.env.REDIS_PASSWORD || undefined;
    const db = this.configService.get<number>('redis.db') || parseInt(process.env.REDIS_DB || '0', 10);

    try {
      this.client = new Redis({
        host,
        port,
        password,
        db,
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 5) {
            // Stop logging retry spam, retry every 30 seconds
            return 30000;
          }
          return Math.min(times * 2000, 10000);
        },
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log(`✅ Redis connected successfully (${host}:${port})`);
      });

      this.client.on('ready', () => {
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        this.logger.warn(`⚠️ Redis is unavailable (${err.message}). Application will operate in direct fallback mode.`);
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });

      // Attempt initial connection without blocking app startup
      await this.client.connect().catch((err) => {
        this.logger.warn(`⚠️ Initial Redis connection failed: ${err.message}. Direct fallback active.`);
      });
    } catch (err: any) {
      this.logger.warn(`⚠️ Could not initialize Redis client: ${err.message}`);
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      }
    }
  }

  /**
   * Check if Redis connection is currently active
   */
  get isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Retrieve cached value (deserializes JSON automatically)
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable || !this.client) return null;
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  /**
   * Store value in cache with optional TTL in seconds
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.isAvailable || !this.client) return false;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error: any) {
      this.logger.warn(`Failed to set cache for key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<boolean> {
    if (!this.isAvailable || !this.client) return false;
    try {
      await this.client.del(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete keys matching a glob pattern (e.g. "dashboard:summary:*")
   */
  async delByPattern(pattern: string): Promise<number> {
    if (!this.isAvailable || !this.client) return 0;
    try {
      const stream = this.client.scanStream({
        match: pattern,
        count: 100,
      });

      let deletedCount = 0;
      const keysToDelete: string[] = [];

      for await (const resultKeys of stream) {
        if (resultKeys.length > 0) {
          keysToDelete.push(...resultKeys);
        }
      }

      if (keysToDelete.length > 0) {
        deletedCount = await this.client.del(...keysToDelete);
      }

      return deletedCount;
    } catch {
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  async has(key: string): Promise<boolean> {
    if (!this.isAvailable || !this.client) return false;
    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch {
      return false;
    }
  }

  /**
   * Get remaining TTL of a key in seconds
   */
  async ttl(key: string): Promise<number> {
    if (!this.isAvailable || !this.client) return -2;
    try {
      return await this.client.ttl(key);
    } catch {
      return -2;
    }
  }
}
