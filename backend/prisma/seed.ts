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

  await prisma.client.createMany({
    data: [
      { studioId: studio.id, name: 'Cliente 1', taxId: '20-00000000-0' },
      { studioId: studio.id, name: 'Cliente 2', taxId: '27-00000000-0' },
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
