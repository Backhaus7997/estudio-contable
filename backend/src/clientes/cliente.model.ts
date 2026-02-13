export type ClienteEstado = 'Activo' | 'Inactivo';

export type Cliente = {
  id: string;
  razonSocial: string;
  cuit?: string;
  email?: string;
  telefono?: string;
  estado: ClienteEstado;
  creadoEn: string; // ISO
  studioId: string;
};

export type CreateClienteInput = {
  razonSocial: string;
  cuit?: string;
  email?: string;
  telefono?: string;
  estado?: ClienteEstado;

studioId: string;
};