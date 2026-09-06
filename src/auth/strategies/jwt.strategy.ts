import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AdminsService } from '../../admins/admins.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private adminsService: AdminsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessSecret') || 'secret',
    });
  }

  async validate(payload: any) {
    const userType = payload.userType || 'user';

    if (userType === 'admin') {
      try {
        const admin = await this.adminsService.findById(Number(payload.sub));
        if (!admin || !admin.isActive || admin.isLocked) {
          throw new UnauthorizedException();
        }
        return {
          userId: admin.id,
          id: admin.id,
          email: admin.email,
          roles: payload.roles || [admin.role],
          mobile: admin.mobile,
          firstName: admin.firstName,
          lastName: admin.lastName,
          isSystem: admin.isSystem,
          userType: 'admin',
        };
      } catch {
        throw new UnauthorizedException();
      }
    }

    try {
      const user = await this.usersService.findById(Number(payload.sub));
      if (!user || !user.isActive || user.isLocked) {
        throw new UnauthorizedException();
      }
      return {
        userId: user.id,
        id: user.id,
        email: user.email,
        roles: payload.roles || user.roles?.map((r) => r.name) || [],
        mobile: user.mobile,
        firstName: user.firstName,
        lastName: user.lastName,
        isSystem: user.isSystem,
        userType: 'user',
      };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
