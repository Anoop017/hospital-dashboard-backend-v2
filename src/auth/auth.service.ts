import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AdminsService } from '../admins/admins.service';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role } from '../roles/entities/role.entity';
import { Role as RoleEnum } from '../common/enums/role.enum';
import { AdminRole } from '../common/enums/admin-role.enum';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Staff } from '../staff/entities/staff.entity';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as crypto from 'crypto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private adminsService: AdminsService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private redisService: RedisService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
    @InjectRepository(Staff)
    private staffRepo: Repository<Staff>,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check admins table first
    const admin = await this.adminsService.findByEmail(normalizedEmail);
    if (admin && (await bcrypt.compare(pass, admin.passwordHash))) {
      const { passwordHash, ...result } = admin;
      return {
        ...result,
        userType: 'admin',
        roles: [{ name: admin.role || AdminRole.ADMIN }],
      };
    }

    // 2. Check portal users table
    const user = await this.usersService.findByEmail(normalizedEmail);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return {
        ...result,
        userType: 'user',
      };
    }

    return null;
  }

  async login(user: any) {
    const isUserAdmin = user.userType === 'admin';
    const roles = isUserAdmin
      ? [user.role || user.roles?.[0]?.name || AdminRole.ADMIN]
      : user.roles?.map((r: any) => (typeof r === 'string' ? r : r.name)) || [];

    const payload = {
      email: user.email,
      sub: user.id,
      roles,
      userType: isUserAdmin ? 'admin' : 'user',
    };

    const accessToken = this.jwtService.sign(payload);

    // Refresh token
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiration'),
    });

    const rt = this.refreshTokenRepo.create({
      token: refreshToken,
      userId: isUserAdmin ? null : user.id,
      adminId: isUserAdmin ? user.id : null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await this.refreshTokenRepo.save(rt);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async register(registerDto: RegisterDto) {
    const saltRounds = parseInt(
      this.configService.get('BCRYPT_SALT_ROUNDS') || '12',
      10,
    );
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    const patientRole = await this.roleRepo.findOne({
      where: { name: RoleEnum.PATIENT },
    });

    const user = await this.usersService.create({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      mobile: registerDto.mobile,
      passwordHash,
      roles: patientRole ? [patientRole] : [],
    });

    const patient = this.patientRepo.create({ userId: user.id });
    await this.patientRepo.save(patient);

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async registerAdmin(registerDto: RegisterDto) {
    return this.adminsService.create({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      mobile: registerDto.mobile,
      password: registerDto.password,
      role: AdminRole.ADMIN,
    });
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const userType = payload.userType || 'user';
      const entityId = Number(payload.sub);

      const whereClause: any = { token: refreshToken, isRevoked: false };
      if (userType === 'admin') {
        whereClause.adminId = entityId;
      } else {
        whereClause.userId = entityId;
      }

      const tokenEntry = await this.refreshTokenRepo.findOne({
        where: whereClause,
      });

      if (!tokenEntry || tokenEntry.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      let roles: string[] = [];
      let email: string = payload.email;

      if (userType === 'admin') {
        const admin = await this.adminsService.findById(entityId);
        if (!admin || !admin.isActive) {
          throw new UnauthorizedException('Admin not found or inactive');
        }
        roles = [admin.role];
        email = admin.email;
      } else {
        const user = await this.usersService.findById(entityId);
        if (!user || !user.isActive) {
          throw new UnauthorizedException('User not found or inactive');
        }
        roles = user.roles?.map((r: any) => r.name) || [];
        email = user.email;
      }

      const newPayload = { email, sub: entityId, roles, userType };
      const newAccessToken = this.jwtService.sign(newPayload);

      return {
        accessToken: newAccessToken,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: number, userType: string = 'user') {
    if (userType === 'admin') {
      const admin = await this.adminsService.findById(userId);
      const { passwordHash, ...adminWithoutPassword } = admin;
      return {
        ...adminWithoutPassword,
        role: admin.role,
        roles: [{ name: admin.role }],
        userType: 'admin',
      };
    }

    const user = await this.usersService.findById(userId);
    const { passwordHash, ...userWithoutPassword } = user;

    let profileId: number | null = null;

    const patient = await this.patientRepo.findOne({ where: { userId } });
    if (patient) {
      profileId = patient.id;
    } else {
      const doctor = await this.doctorRepo.findOne({ where: { userId } });
      if (doctor) {
        profileId = doctor.id;
      } else {
        const staff = await this.staffRepo.findOne({ where: { userId } });
        if (staff) {
          profileId = staff.id;
        }
      }
    }

    return {
      ...userWithoutPassword,
      profileId,
      userType: 'user',
    };
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
    userType: string = 'user',
  ) {
    const saltRounds = parseInt(
      this.configService.get('BCRYPT_SALT_ROUNDS') || '12',
      10,
    );

    if (userType === 'admin') {
      const admin = await this.adminsService.findById(userId);
      const isOldValid = await bcrypt.compare(
        changePasswordDto.oldPassword,
        admin.passwordHash,
      );
      if (!isOldValid) {
        throw new BadRequestException('Current password is incorrect');
      }
      admin.passwordHash = await bcrypt.hash(
        changePasswordDto.newPassword,
        saltRounds,
      );
      await this.adminsService.save(admin);
      return { message: 'Password updated successfully' };
    }

    const user = await this.usersService.findById(userId);
    const isOldValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.passwordHash,
    );

    if (!isOldValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      saltRounds,
    );
    await this.usersService.update(user.id, {
      passwordHash: user.passwordHash,
    } as any);

    return { message: 'Password updated successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = forgotPasswordDto.email.trim().toLowerCase();

    // Check admin first, then user
    const admin = await this.adminsService.findByEmail(email);
    const user = !admin ? await this.usersService.findByEmail(email) : null;

    if (!admin && !user) {
      return {
        message:
          'If this email address is registered, a password reset link has been sent.',
      };
    }

    const token = crypto.randomBytes(24).toString('hex');
    const resetCode = token.substring(0, 6).toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    if (admin) {
      admin.resetPasswordToken = token;
      admin.resetPasswordExpires = expiresAt;
      await this.adminsService.save(admin);
      await this.redisService.set(
        `reset_token:${token}`,
        { userId: admin.id, email: admin.email, userType: 'admin' },
        15 * 60,
      );

      const portalBaseUrl =
        this.configService.get<string>('mail.adminPortalUrl') ||
        'http://localhost:3001';
      const resetLink = `${portalBaseUrl}/reset-password?token=${token}`;

      this.mailService
        .sendPasswordResetEmail(admin.email, {
          name: admin.firstName
            ? `${admin.firstName} ${admin.lastName || ''}`.trim()
            : 'Admin',
          resetLink,
          resetCode,
          expiresInMinutes: 15,
        })
        .catch((err) =>
          console.error('Failed to send password reset email:', err),
        );
    } else if (user) {
      user.resetPasswordToken = token;
      user.resetPasswordExpires = expiresAt;
      await this.usersService.save(user);
      await this.redisService.set(
        `reset_token:${token}`,
        { userId: user.id, email: user.email, userType: 'user' },
        15 * 60,
      );

      const isStaffOrDoctor = user.roles?.some((r) =>
        ['doctor', 'nurse', 'receptionist', 'staff'].includes(r.name),
      );
      const portalBaseUrl = isStaffOrDoctor
        ? this.configService.get<string>('mail.adminPortalUrl') ||
          'http://localhost:3001'
        : this.configService.get<string>('mail.patientPortalUrl') ||
          'http://localhost:3000';

      const resetLink = `${portalBaseUrl}/reset-password?token=${token}`;

      this.mailService
        .sendPasswordResetEmail(user.email, {
          name: user.firstName
            ? `${user.firstName} ${user.lastName || ''}`.trim()
            : 'User',
          resetLink,
          resetCode,
          expiresInMinutes: 15,
        })
        .catch((err) =>
          console.error('Failed to send password reset email:', err),
        );
    }

    return {
      message:
        'If this email address is registered, a password reset link has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const token = resetPasswordDto.token.trim();

    const cachedToken = await this.redisService.get<{
      userId: number;
      email: string;
      userType?: string;
    }>(`reset_token:${token}`);
    const userType = cachedToken?.userType || 'user';

    let targetAdmin = null;
    let targetUser = null;

    if (cachedToken) {
      if (userType === 'admin') {
        targetAdmin = await this.adminsService
          .findById(cachedToken.userId)
          .catch(() => null);
      } else {
        targetUser = await this.usersService
          .findById(cachedToken.userId)
          .catch(() => null);
      }
    } else {
      targetAdmin = await this.adminsService.findByResetToken(token);
      if (!targetAdmin) {
        targetUser = await this.usersService.findByResetToken(token);
      }
    }

    const saltRounds = parseInt(
      this.configService.get('BCRYPT_SALT_ROUNDS') || '12',
      10,
    );

    if (targetAdmin) {
      if (
        !targetAdmin.resetPasswordExpires ||
        new Date() > new Date(targetAdmin.resetPasswordExpires)
      ) {
        targetAdmin.resetPasswordToken = null as any;
        targetAdmin.resetPasswordExpires = null as any;
        await this.adminsService.save(targetAdmin);
        await this.redisService.del(`reset_token:${token}`);
        throw new BadRequestException(
          'Password reset token has expired. Please request a new one.',
        );
      }

      targetAdmin.passwordHash = await bcrypt.hash(
        resetPasswordDto.newPassword,
        saltRounds,
      );
      targetAdmin.resetPasswordToken = null as any;
      targetAdmin.resetPasswordExpires = null as any;
      await this.adminsService.save(targetAdmin);
      await this.redisService.del(`reset_token:${token}`);

      return {
        message:
          'Your password has been successfully reset. You can now log in with your new password.',
      };
    }

    if (targetUser) {
      if (
        !targetUser.resetPasswordExpires ||
        new Date() > new Date(targetUser.resetPasswordExpires)
      ) {
        targetUser.resetPasswordToken = null as any;
        targetUser.resetPasswordExpires = null as any;
        await this.usersService.save(targetUser);
        await this.redisService.del(`reset_token:${token}`);
        throw new BadRequestException(
          'Password reset token has expired. Please request a new one.',
        );
      }

      targetUser.passwordHash = await bcrypt.hash(
        resetPasswordDto.newPassword,
        saltRounds,
      );
      targetUser.resetPasswordToken = null as any;
      targetUser.resetPasswordExpires = null as any;
      await this.usersService.save(targetUser);
      await this.redisService.del(`reset_token:${token}`);

      return {
        message:
          'Your password has been successfully reset. You can now log in with your new password.',
      };
    }

    throw new BadRequestException('Invalid or expired password reset token.');
  }
}
