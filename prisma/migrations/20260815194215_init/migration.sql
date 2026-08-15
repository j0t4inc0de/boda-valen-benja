-- CreateTable
CREATE TABLE "Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "names" TEXT NOT NULL DEFAULT 'Valentina & Benjamín',
    "musicUrl" TEXT NOT NULL DEFAULT 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    "heroBg" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070',
    "introTitle" TEXT NOT NULL DEFAULT 'Nos casamos',
    "introText" TEXT NOT NULL DEFAULT 'Con mucha alegría queremos invitarlos a ser parte de uno de los días mas importantes de nuestras vidas.',
    "weddingDate" DATETIME NOT NULL DEFAULT '2026-09-12 08:00:00 +00:00',
    "mapImage" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074',
    "address" TEXT NOT NULL DEFAULT 'Héctor Calvo 380, Cerro Bellavista, Valparaíso',
    "hotelName" TEXT NOT NULL DEFAULT 'Hotel Boutique Cabernet',
    "mapUrl" TEXT NOT NULL DEFAULT 'https://maps.app.goo.gl/d279EPkFbn2TvADs9',
    "dressCode" TEXT NOT NULL DEFAULT 'Semi formal',
    "giftText" TEXT NOT NULL DEFAULT 'Lo más importante para nosotros es contar con su presencia y compartir juntos este día tan especial. Sin embargo, si desean hacernos un regalo, agradeceremos su cariño a través de la siguiente cuenta:',
    "bankName" TEXT NOT NULL DEFAULT 'Banco de Chile',
    "bankAccountType" TEXT NOT NULL DEFAULT 'Cuenta Corriente',
    "bankAccountNumber" TEXT NOT NULL DEFAULT '123-45678-90',
    "bankAccountOwner" TEXT NOT NULL DEFAULT 'Valentina & Benjamín',
    "bankAccountRut" TEXT NOT NULL DEFAULT '12.345.678-9',
    "bankAccountEmail" TEXT NOT NULL DEFAULT 'valentina.benjamin@matrimonio.cl',
    "footerText" TEXT NOT NULL DEFAULT 'Muchas gracias por acompañarnos en este momento tan importante de nuestras vidas.'
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "rut" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "isAttending" BOOLEAN NOT NULL,
    "companionsCount" INTEGER NOT NULL DEFAULT 0,
    "companionsNames" TEXT NOT NULL DEFAULT '',
    "dietaryRestrictions" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
