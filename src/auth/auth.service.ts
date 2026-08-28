import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role } from '../roles/entities/role.entity';
import { Role as RoleEnum } from '../common/enums/role.enum';
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
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, roles: user.roles?.map((r: any) => r.name) || [] };
    const accessToken = this.jwtService.sign(payload);

    // Refresh token
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiration'),
    });

    const rt = this.refreshTokenRepo.create({
      token: refreshToken,
      userId: user.id,
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
    const saltRounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS') || '12', 10);
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    let patientRole = await this.roleRepo.findOne({ where: { name: RoleEnum.PATIENT } });

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
    const saltRounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS') || '12', 10);
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    let adminRole = await this.roleRepo.findOne({ where: { name: RoleEnum.ADMIN } });

    const user = await this.usersService.create({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      mobile: registerDto.mobile,
      passwordHash,
      roles: adminRole ? [adminRole] : [],
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const tokenEntry = await this.refreshTokenRepo.findOne({
        where: { token: refreshToken, userId: Number(payload.sub), isRevoked: false },
      });

      if (!tokenEntry || tokenEntry.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await this.usersService.findById(Number(payload.sub));
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = { email: user.email, sub: user.id, roles: user.roles?.map((r: any) => r.name) || [] };
      const newAccessToken = this.jwtService.sign(newPayload);

      return {
        accessToken: newAccessToken,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: number) {
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
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    const isOldValid = await bcrypt.compare(changePasswordDto.oldPassword, user.passwordHash);

    if (!isOldValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const saltRounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS') || '12', 10);
    user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);

    await this.usersService.update(user.id, { passwordHash: user.passwordHash } as any);

    return { message: 'Password updated successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email.trim().toLowerCase());

    // Security best practice: If user not found, don't leak information, return generic success message
    if (!user) {
      return { message: 'If this email address is registered, a password reset link has been sent.' };
    }

    // Generate secure random token
    const token = crypto.randomBytes(24).toString('hex');
    const resetCode = token.substring(0, 6).toUpperCase();

    // Set 15 minutes expiration
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiresAt;
    await this.usersService.save(user);

    // Also store token in Redis with 15 minutes (900 seconds) auto-expiry
    await this.redisService.set(`reset_token:${token}`, { userId: user.id, email: user.email }, 15 * 60);

    // Determine appropriate portal reset link based on roles
    const isAdminOrStaff = user.roles?.some((r) => ['admin', 'super_admin', 'doctor', 'receptionist', 'staff'].includes(r.name));
    const portalBaseUrl = isAdminOrStaff
      ? (this.configService.get<string>('mail.adminPortalUrl') || 'http://localhost:3001')
      : (this.configService.get<string>('mail.patientPortalUrl') || 'http://localhost:3000');

    const resetLink = `${portalBaseUrl}/reset-password?token=${token}`;

    // Send the email asynchronously without blocking the response
    this.mailService
      .sendPasswordResetEmail(user.email, {
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User',
        resetLink,
        resetCode,
        expiresInMinutes: 15,
      })
      .catch((err) => console.error('Failed to send password reset email:', err));

    return {
      message: 'If this email address is registered, a password reset link has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const token = resetPasswordDto.token.trim();
    
    // Check Redis first for fast token validation
    const cachedToken = await this.redisService.get<{ userId: number; email: string }>(`reset_token:${token}`);
    let user = cachedToken ? await this.usersService.findById(cachedToken.userId) : null;

    // Fallback to database lookup
    if (!user) {
      user = await this.usersService.findByResetToken(token);
    }

    if (!user || !user.resetPasswordExpires) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    if (new Date() > new Date(user.resetPasswordExpires)) {
      user.resetPasswordToken = null as any;
      user.resetPasswordExpires = null as any;
      await this.usersService.save(user);
      await this.redisService.del(`reset_token:${token}`);
      throw new BadRequestException('Password reset token has expired. Please request a new one.');
    }

    const saltRounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS') || '12', 10);
    user.passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, saltRounds);
    user.resetPasswordToken = null as any;
    user.resetPasswordExpires = null as any;

    await this.usersService.save(user);
    await this.redisService.del(`reset_token:${token}`);

    return {
      message: 'Your password has been successfully reset. You can now log in with your new password.',
    };
  }
}
