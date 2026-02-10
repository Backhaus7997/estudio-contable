import {
  BadRequestException,
  Controller,
  Get,
  Body,
  Post,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { IsEmail, IsString } from 'class-validator';

class LoginDto {
  @IsString()
  @IsEmail()
  email!: string;

  // DEV: lo dejamos opcional para tu demo
  // En prod: @IsString() password!: string;
  @IsString()
  password?: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      version: process.env.npm_package_version ?? '0.0.1',
      env: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('db-check')
  async dbCheck() {
    const [studios, users, clients] = await Promise.all([
      this.prisma.studio.count(),
      this.prisma.user.count(),
      this.prisma.client.count(),
    ]);
    return { ok: true, studios, users, clients };
  }

  @Post('auth/login')
  @UsePipes(
    new ValidationPipe({
      whitelist: true, // descarta campos extra
      forbidNonWhitelisted: true, // si mandan extras, falla
      transform: true,
    }),
  )
  async login(@Body() body: LoginDto) {
    const { email } = body;

    // DEV ONLY: login sin password para destrabar la demo.
    // Más adelante: agregar passwordHash + bcrypt + JWT.
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, studioId: true, createdAt: true },
    });

    if (!user) {
      // Podés usar 404 si preferís, pero en auth suele ser 401 para no filtrar usuarios.
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      ok: true,
      token: 'dev-token',
      user,
    };
  }

  // OPCIONAL: útil para el frontend (en dev lo hacemos “mock”)
  // En prod: validar JWT/guard y sacar el userId del token.
  @Get('me')
  async me() {
    // DEV: devolvemos el primer usuario para probar UI rápido
    const user = await this.prisma.user.findFirst({
      select: { id: true, email: true, name: true, studioId: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!user) throw new BadRequestException('No hay usuarios en la base');
    return { ok: true, user };
  }
}