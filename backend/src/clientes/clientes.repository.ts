import { Injectable } from '@nestjs/common';
import type { ClienteEstado } from './cliente.model';
import { PrismaService } from '../../prisma/prisma.service';
export type ListClientesParams = { q?: string; estado?: ClienteEstado };

export type CreateClienteInput = {
  razonSocial: string;
  cuit?: string;
  email?: string;
  telefono?: string;
  estado?: ClienteEstado;
  studioId: string;
};

export type UpdateClienteInput = Partial<CreateClienteInput>;

@Injectable()
export class ClientesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(params?: ListClientesParams) {
    const q = params?.q?.trim();
    const estado = params?.estado;

    return this.prisma.cliente.findMany({
      where: {
        ...(estado ? { estado } : {}),
        ...(q
          ? {
              OR: [
                { razonSocial: { contains: q, mode: 'insensitive' } },
                { cuit: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async getById(id: string) {
    return this.prisma.cliente.findUnique({ where: { id } });
  }

  async create(input: CreateClienteInput) {
    const studioId = input.studioId ?? (await this.prisma.studio.findFirst({ select: { id: true } }))?.id;

    if (!studioId) throw new Error("No existe Studio para asociar el cliente");

    return this.prisma.cliente.create({
      data: {
        razonSocial: input.razonSocial,
        cuit: input.cuit ?? null,
        email: input.email ?? null,
        telefono: input.telefono ?? null,
        estado: input.estado ?? "Activo",
        studio: { connect: { id: studioId } },
      },
    });
  }
  
  async update(id: string, patch: UpdateClienteInput) {
    return this.prisma.cliente.update({
      where: { id },
      data: {
        ...(patch.razonSocial !== undefined ? { razonSocial: patch.razonSocial } : {}),
        ...(patch.cuit !== undefined ? { cuit: patch.cuit } : {}),
        ...(patch.email !== undefined ? { email: patch.email } : {}),
        ...(patch.telefono !== undefined ? { telefono: patch.telefono } : {}),
        ...(patch.estado !== undefined ? { estado: patch.estado } : {}),
      },
    });
  }
}