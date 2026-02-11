import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import type { ClienteEstado } from './cliente.model';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly service: ClientesService) {}

  // GET /clientes?q=acme&estado=Activo
  @Get()
  list(
    @Query('q') q?: string,
    @Query('estado') estado?: ClienteEstado,
  ) {
    return this.service.list({ q, estado });
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      razonSocial: string;
      cuit?: string;
      email?: string;
      telefono?: string;
      estado?: ClienteEstado;
    },
  ) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      razonSocial?: string;
      cuit?: string;
      email?: string;
      telefono?: string;
      estado?: ClienteEstado;
    },
  ) {
    return this.service.update(id, body);
  }
}