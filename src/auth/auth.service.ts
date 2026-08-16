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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
    
    // Simplistic refresh token for now
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
        where: { token: refreshToken, userId: payload.sub, isRevoked: false },
      });

      if (!tokenEntry || tokenEntry.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await this.usersService.findById(payload.sub);
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

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    const { passwordHash, ...userWithoutPassword } = user;

    let profileId: string | null = null;

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

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
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
}
