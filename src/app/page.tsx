import React from "react";
import { prisma } from "@/lib/db";
import InvitationClient from "@/components/InvitationClient";

// Esta página se regenera dinámicamente para siempre mostrar los textos correctos
export const revalidate = 0;

export default async function Home() {
  // Obtener configuraciones de la base de datos
  let settings = await prisma.settings.findUnique({
    where: { id: 1 },
  });

  // Si por alguna razón no se encuentran las configuraciones (por ejemplo, base de datos limpia)
  // devolvemos valores por defecto consistentes con el seed
  if (!settings) {
    settings = {
      id: 1,
      names: "Valentina & Benjamín",
      musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      heroBg: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070",
      introTitle: "Nos Unimos",
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
      bankAccountOwner: "Valentina",
      bankAccountRut: "18.765.432-1",
      bankAccountEmail: "valentina@gmail.com",
      footerText: "Muchas gracias por acompañarnos en este momento tan importante de nuestras vidas."
    };
  }

  // Convertimos las fechas a string para que no causen problemas de serialización en el cliente
  const serializedSettings = {
    ...settings,
    weddingDate: settings.weddingDate instanceof Date 
      ? settings.weddingDate.toISOString() 
      : new Date(settings.weddingDate).toISOString(),
  };

  return <InvitationClient settings={serializedSettings} />;
}
