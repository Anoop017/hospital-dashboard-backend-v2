import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync, IsOptional } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  APP_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  APP_PORT: number = 3000;

  @IsString()
  @IsOptional()
  API_PREFIX: string = 'api/v1';

  @IsString()
  @IsOptional()
  CORS_ORIGINS: string = '*';

  @IsString()
  POSTGRES_HOST!: string;

  @IsNumber()
  POSTGRES_PORT!: number;

  @IsString()
  POSTGRES_USERNAME!: string;

  @IsString()
  POSTGRES_PASSWORD!: string;

  @IsString()
  POSTGRES_DATABASE!: string;

  @IsString()
  MONGODB_URI!: string;

  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRATION: string = '15m';

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRATION: string = '7d';

  @IsNumber()
  @IsOptional()
  BCRYPT_SALT_ROUNDS: number = 12;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
