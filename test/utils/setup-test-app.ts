import { createStubInstance } from 'sinon';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { AppModule } from '../../src/app.module';
import { Api } from './api';
import { PROVIDERS } from '../../src/constants';
import { Factory } from './factories';
import { MailService } from '../../src/modules/shared/passwordReset/mail.service';
import { INestApplication } from '@nestjs/common';

interface TestAppSetup {
    app: INestApplication;
    api: Api;
    db: NodePgDatabase<Record<string, never>>;
    factory: Factory;
    mailServiceMock: sinon.SinonStubbedInstance<MailService>;
}

function applyMocks(builder: TestingModuleBuilder, mocks: { provide: any; useValue: any }[]) {
    const appliedMocks: Record<string, any> = {};

    mocks.forEach(({ provide, useValue }) => {
        builder.overrideProvider(provide).useValue(useValue);
        appliedMocks[provide.name || provide] = useValue;
    });

    return appliedMocks;
}

export async function setupTestApp(): Promise<TestAppSetup> {
    const mailServiceMock = createStubInstance(MailService);

    const builder: TestingModuleBuilder = Test.createTestingModule({
        imports: [AppModule],
    });

    const mocks = applyMocks(builder, [{ provide: MailService, useValue: mailServiceMock }]);

    const moduleFixture = await builder.compile();

    const app = moduleFixture.createNestApplication();
    await app.init();

    const api = new Api(app);
    const db = app.get<NodePgDatabase>(PROVIDERS.DRIZZLE);
    const factory = new Factory(db);

    return { app, api, db, factory, mailServiceMock, ...mocks };
}
