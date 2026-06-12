// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET, // ⚠️ asegurate que esté definido
        });
    }

    async validate(payload: any) {
        // BUGFIX: el token se firma con { sub: user.id, email }, no con { id }.
        // Antes esto devolvía payload.id (undefined), rompiendo req.user.id en todos los endpoints protegidos.
        return { id: payload.sub, email: payload.email };
    }
}
