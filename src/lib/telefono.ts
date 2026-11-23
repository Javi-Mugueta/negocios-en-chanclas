export function enlaceWhatsapp(telefono: string | null | undefined): string | null {
  if (!telefono) return null;
  let digitos = telefono.replace(/\D/g, "");
  if (digitos.startsWith("00")) digitos = digitos.slice(2);
  if (digitos.length === 9) digitos = `34${digitos}`;
  if (digitos.length < 8 || digitos.length > 15) return null;
  return `https://wa.me/${digitos}`;
}

export function enlaceEmail(email: string): string {
  return `mailto:${email}`;
}
