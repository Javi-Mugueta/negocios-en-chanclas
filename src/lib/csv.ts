function celda(value: unknown): string {
  const texto =
    value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  const seguro = /^[=+\-@\t\r]/.test(texto) ? `'${texto}` : texto;
  if (/[",\n\r]/.test(seguro)) return `"${seguro.replaceAll('"', '""')}"`;
  return seguro;
}

export function aCsv(columnas: string[], filas: unknown[][]): string {
  const lineas = [columnas.map(celda).join(","), ...filas.map((fila) => fila.map(celda).join(","))];
  return `\uFEFF${lineas.join("\r\n")}\r\n`;
}
