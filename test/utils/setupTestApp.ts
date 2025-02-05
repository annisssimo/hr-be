import { Test, TestingModule } from '@nestjs/testing';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { AppModule } from '../../src/app.module';
import { Api } from './api';
import { PROVIDERS } from '../../src/constants';
import { Factory } from './factories';

export function setupTestApp() {
    let testContext: { app: any; api: Api; db: NodePgDatabase; factory: Factory };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        const app = moduleFixture.createNestApplication();
        await app.init();

        const api = new Api(app);
        const db = app.get<NodePgDatabase>(PROVIDERS.DRIZZLE);
        const factory = new Factory(db, api);

        testContext = { app, api, db, factory };
    });

    afterAll(async () => {
        await testContext.app.close();
    });

    return () => testContext;
}
