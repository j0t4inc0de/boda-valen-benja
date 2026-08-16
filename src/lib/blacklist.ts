// Lista de RUTs restringidos / lista negra
// Puedes agregar los RUTs con o sin puntos ni guión (ej: "157978462", "11.914.814-6", etc.)
export const BLACKLIST_RUTS: string[] = [
  "157978462",
  "119148146",
  // Agrega los siguientes RUTs aquí abajo:
  // "123456789",
];

export function isRutBlacklisted(rut: string): boolean {
  if (!rut) return false;
  const cleanRut = rut.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return BLACKLIST_RUTS.map((r) => r.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()).includes(cleanRut);
}
