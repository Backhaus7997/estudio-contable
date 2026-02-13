import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const studio = await prisma.studio.create({
    data: { name: 'Estudio Demo' },
  });

  await prisma.user.create({
    data: {
      studioId: studio.id,
      email: 'demo@estudio.com',
      name: 'Demo User',
    },
  });

  await prisma.cliente.createMany({
    data: [
      { studioId: studio.id, razonSocial: 'Cliente 1', cuit: '20-00000000-0' },
      { studioId: studio.id, razonSocial: 'Cliente 2', cuit: '27-00000000-0' },
    ],
  });

  console.log('Seed OK', { studioId: studio.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
