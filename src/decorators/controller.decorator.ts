import { applyDecorators, Controller as OriginalController, SetMetadata } from '@nestjs/common';
import { ZodSchema } from 'zod';

export interface OverloadedControllerOptions<T = unknown> {
    requireAuth?: boolean;
    statusCheck?: boolean;
    validationSchema?: ZodSchema<T>;
}

export function Controller<T = unknown>(
    path: string,
    options: OverloadedControllerOptions<T> = {},
) {
    const decorators = [
        OriginalController(path),
        SetMetadata('requireAuth', options.requireAuth ?? false),
        SetMetadata('statusCheck', options.statusCheck ?? false),
    ];

    if (options.validationSchema) {
        decorators.push(SetMetadata('validationSchema', options.validationSchema));
    }

    return applyDecorators(...decorators);
}
