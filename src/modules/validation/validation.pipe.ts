import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly zodSchema: ZodSchema) {}
    public transform(value: any, metadata: ArgumentMetadata) {
        if (
            (metadata.type === 'body' && (!value || Object.keys(value).length === 0)) ||
            (metadata.type === 'query' && !value)
        ) {
            return value;
        }

        try {
            const parsedValue = this.zodSchema.parse(value);
            return parsedValue;
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.errors.map((err) => ({
                    message: err.message,
                    field: err.path.join('.'),
                }));

                throw new BadRequestException({
                    message: 'Validation failed',
                    errors: formattedErrors,
                });
            } else {
                throw new BadRequestException(`Unexpected error: ${error.message} `);
            }
        }
    }
}
