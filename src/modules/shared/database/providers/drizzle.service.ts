import { Injectable, Logger } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { settings } from '../../../../../config/settings';

type DrizzleDatabase = ReturnType<typeof drizzle>;

@Injectable()
export class DrizzleService {
    private drizzle: DrizzleDatabase;
    private client: Client;
    private isConnected = false;
    private reconnecting = false;
    private readonly logger = new Logger(DrizzleService.name);

    constructor() {
        this.connect();
    }

    private async initiateClient() {
        this.client = new Client({
            connectionString: settings.DATABASE.url,
        });
        this.attachErrorHandler(this.client);
        await this.client.connect();
        this.drizzle = drizzle({ client: this.client });
        this.isConnected = true;
    }

    public async connect(): Promise<void> {
        try {
            await this.initiateClient();
        } catch (error: any) {
            this.isConnected = false;
            this.logger.error(
                `Connection failed: ${error.message || 'unknown error'}. Trying to connect again...`,
            );
            await this.reconnect();
        }
    }

    private async reconnect(): Promise<void> {
        const interval = 5000;
        const maxAttempts = 5;
        let attempts = 0;
        while (attempts < maxAttempts) {
            try {
                attempts++;
                await this.initiateClient();
                this.logger.log(`Reconnected successfully.`);
                return;
            } catch (error: any) {
                this.isConnected = false;
                this.logger.error(
                    `Reconnect attempt ${attempts} failed: ${error.message || 'unknown error'}. Retrying in ${interval / 1000} seconds...`,
                );
                await new Promise((resolve) => setTimeout(resolve, interval));
            }
        }

        this.logger.error('Reconnection failed after 1.5 minutes of retries.');
    }

    private attachErrorHandler(client: Client): void {
        client.on('error', (error) => {
            this.isConnected = false;
            this.logger.error(`Postgres client error event: ${error.message}`);
            if (!this.reconnecting) {
                this.reconnecting = true;
                this.reconnect().finally(() => {
                    this.reconnecting = false;
                });
            }
        });
    }

    public async disconnect() {
        await this.client.end();
        this.isConnected = false;
    }

    public getDrizzle(): DrizzleDatabase {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }

        return new Proxy(
            {},
            {
                get: (_target, propKey) => {
                    if (!this.isConnected) {
                        throw new Error('Database not connected');
                    }
                    const currentDrizzle = drizzle({ client: this.client });
                    const property = currentDrizzle[propKey as keyof DrizzleDatabase];
                    if (typeof property === 'function') {
                        return property.bind(currentDrizzle);
                    }
                    return property;
                },
            },
        ) as DrizzleDatabase;
    }

    public isDbConnected(): boolean {
        return this.isConnected;
    }
}
