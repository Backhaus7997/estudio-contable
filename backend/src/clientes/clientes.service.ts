import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ClientesRepository, ListClientesParams } from './clientes.repository';
import type { ClienteEstado } from './cliente.model';

@Injectable()
export class ClientesService {
  constructor(private readonly repo: ClientesRepository) {}

  async list(params?: ListClientesParams) {
    return this.repo.list(params);
  }

  async getById(id: string) {
    const found = await this.repo.getById(id);
    if (!found) throw new NotFoundException('Cliente no encontrado');
    return found;
  }

  async create(input: {
    razonSocial: string;
    cuit?: string;
    email?: string;
    telefono?: string;
    estado?: ClienteEstado;
    studioId: string;
  }) {
    if (!input.razonSocial?.trim()) throw new BadRequestException('razonSocial es obligatoria');

  return this.repo.create({
    razonSocial: input.razonSocial.trim(),
    cuit: input.cuit?.trim(),
    email: input.email?.trim(),
    telefono: input.telefono?.trim(),
    estado: input.estado ?? 'Activo',
    studioId: input.studioId, // 👈 ESTA LÍNEA
    });  
  }

  async update(
    id: string,
    patch: { razonSocial?: string; cuit?: string; email?: string; telefono?: string; estado?: ClienteEstado },
  ) {
    // valida razonSocial si viene
    if (patch.razonSocial !== undefined && !patch.razonSocial.trim()) {
      throw new BadRequestException('razonSocial no puede ser vacía');
    }

    // prisma.update tira error si no existe → lo convertimos a 404
    try {
      return await this.repo.update(id, {
        razonSocial: patch.razonSocial?.trim(),
        cuit: patch.cuit?.trim(),
        email: patch.email?.trim(),
        telefono: patch.telefono?.trim(),
        estado: patch.estado,
      });
    } catch {
      throw new NotFoundException('Cliente no encontrado');
    }
  }
}