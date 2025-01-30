import { drizzle } from 'drizzle-orm/node-postgres';
import { Injectable } from '@nestjs/common';
import { settings } from 'config/settings';
import { Client } from 'pg';
@Injectable()
export class DrizzleService {
    private drizzle;
    private client: Client;
    constructor() {
        this.client = new Client({
            connectionString: settings.DATABASE.url,
        });
        this.client.connect();
    }

    public async connect(): Promise<void> {
        try {
            this.drizzle = drizzle({ client: this.client });
        } catch (error) {
            throw new Error(`Database conection failed: ${error.message}`);
        }
    }

    public async disconnect() {
        await this.client.end();
    }

    public getDrizzle() {
        return this.drizzle;
    }
}
