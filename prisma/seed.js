const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  const dbPath = path.join(process.cwd(), 'dev.db');
  dbUrl = `file:${dbPath}`;
} else if (!dbUrl.startsWith('file:')) {
  dbUrl = `file:${dbUrl}`;
}

const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Crear o actualizar usuario Administrador Principal
  const adminUsername = 'admin';
  const adminPassword = 'matrimonio2026';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { username: adminUsername },
    update: { password: hashedPassword },
    create: {
      username: adminUsername,
      password: hashedPassword,
    },
  });
  console.log(`Admin user creado/actualizado: ${admin.username} (Clave: ${adminPassword})`);

  // 2. Crear o actualizar usuario Administrador para la Cuñada
  const cunaUsername = 'cuñaita';
  const cunaPassword = 'antoyjotasonlosmejores';
  const hashedCunaPassword = await bcrypt.hash(cunaPassword, 10);

  const cunaAdmin = await prisma.admin.upsert({
    where: { username: cunaUsername },
    update: { password: hashedCunaPassword },
    create: {
      username: cunaUsername,
      password: hashedCunaPassword,
    },
  });
  console.log(`Admin user creado/actualizado: ${cunaAdmin.username} (Clave: ${cunaPassword})`);

  // 3. Crear o actualizar configuración por defecto
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      names: "Valentina & Benjamín",
      musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      heroBg: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070",
      introTitle: "Nos casamos",
      introText: "Con mucha alegría queremos invitarlos a ser parte de uno de los días mas importantes de nuestras vidas.",
      weddingDate: new Date("2026-09-12T08:00:00Z"),
      mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074",
      address: "Héctor Calvo 380, Cerro Bellavista, Valparaíso",
      hotelName: "Hotel Boutique Cabernet",
      mapUrl: "https://maps.app.goo.gl/fwNYue3taX2r1HUy7",
      dressCode: "Semi formal",
      giftText: "Lo más importante para nosotros es contar con su presencia y compartir juntos este día tan especial. Sin embargo, si desean hacernos un regalo, agradeceremos su cariño a través de la siguiente cuenta:",
      bankName: "Banco de Chile",
      bankAccountType: "Cuenta Corriente",
      bankAccountNumber: "123-45678-90",
      bankAccountOwner: "valentina",
      bankAccountRut: "18.765.432-1",
      bankAccountEmail: "valentina@gmail.com",
      footerText: "Muchas gracias por acompañarnos en este momento tan importante de nuestras vidas."
    },
  });
  console.log('Configuraciones por defecto creadas/actualizadas.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
