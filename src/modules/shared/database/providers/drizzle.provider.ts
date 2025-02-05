import { PROVIDERS } from '../../../../constants';
import { DrizzleService } from './drizzle.service';

export const DrizzleProvider = {
    provide: PROVIDERS.DRIZZLE,
    useFactory: async (drizzleService: DrizzleService) => {
        await drizzleService.connect();
        return drizzleService.getDrizzle();
    },
    inject: [DrizzleService],
};
