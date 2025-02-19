import { createStubInstance } from 'sinon';
import * as sinon from 'sinon';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { Api } from './api';
import { PROVIDERS } from '../../src/constants';
import { Factory } from './factories';
import { CloudinaryService } from '../../src/modules/shared/database/providers/cloudinary.service';
import { MailService } from '../../src/modules/shared/passwordReset/mail.service';

interface TestAppSetup {
    app: INestApplication;
    api: Api;
    db: NodePgDatabase<Record<string, never>>;
    factory: Factory;
    cloudinaryServiceMock: sinon.SinonStubbedInstance<CloudinaryService>;
    mailServiceMock: sinon.SinonStubbedInstance<MailService>;
    [key: string]: any;
}

function applyMocks(
    builder: TestingModuleBuilder,
    mocks: { provide: any; useValue: any }[],
): Record<string, any> {
    const appliedMocks: Record<string, any> = {};

    mocks.forEach(({ provide, useValue }) => {
        builder.overrideProvider(provide).useValue(useValue);
        const key = typeof provide === 'function' ? provide.name : String(provide);
        appliedMocks[key] = useValue;
    });

    return appliedMocks;
}

export async function setupTestApp(): Promise<TestAppSetup> {
    const mailServiceMock = createStubInstance(MailService);
    const cloudinaryServiceMock = createStubInstance(CloudinaryService);
    const builder: TestingModuleBuilder = Test.createTestingModule({
        imports: [AppModule],
    });

    const mocks = applyMocks(builder, [
        { provide: MailService, useValue: mailServiceMock },
        { provide: CloudinaryService, useValue: cloudinaryServiceMock },
    ]);

    const moduleFixture = await builder.compile();

    const app = moduleFixture.createNestApplication();
    await app.init();

    const api = new Api(app);
    const db = app.get<NodePgDatabase<Record<string, never>>>(PROVIDERS.DRIZZLE);
    const factory = new Factory(db);

    return {
        app,
        api,
        db,
        factory,
        cloudinaryServiceMock,
        mailServiceMock,
        ...mocks,
    };
}
