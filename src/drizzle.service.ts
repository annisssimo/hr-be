import { drizzle } from 'drizzle-orm/node-postgres';
import { Injectable } from '@nestjs/common';
import { settings } from 'config/settings';
import { Client } from 'pg';

@Injectable()
export class DrizzleProvider {
    private drizzle;
    private client: Client;

    constructor() {
        this.connect();
    }

    connect() {
        this.client = new Client({
            connectionString: settings.DATABASE.url,
        });
        this.client.connect();
        this.drizzle = drizzle(this.client);
    }

    disconnect() {
        this.client.end();
    }

    getDrizzle() {
        return this.drizzle;
    }
}
