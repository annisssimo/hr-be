import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../database/models';

@Injectable()
export class JWTService {
    constructor(private readonly nestJwtService: JwtService) {}

    public sign(user: User) {
        const payload = this.mapUserToTokenPayload(user);

        const accessToken = this.nestJwtService.sign(payload);

        return {
            accessToken: accessToken,
        };
    }

    public verify(token: string) {
        return this.nestJwtService.verify(token);
    }

    private mapUserToTokenPayload(user: User) {
        return {
            id: user.id,
        };
    }
}
