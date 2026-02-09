import { Controller, Get, Body, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

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
  async login(@Body() body: { email: string; password: string }) {
    const { email } = body;

    if (!email) {
      return { ok: false, error: 'email is required' };
    }

    // DEV ONLY: login sin password para destrabar la demo.
    // Más adelante: agregar passwordHash + bcrypt + JWT.
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, studioId: true, createdAt: true },
    });

    if (!user) {
      return { ok: false, error: 'Usuario no encontrado' };
    }

    return {
      ok: true,
      token: 'dev-token',
      user,
    };
  }
}
