const ZONA = "Europe/Madrid";

function partes(fecha: Date): Record<string, string> {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA,
    hourCycle: "h23",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const bag: Record<string, string> = {};
  for (const p of fmt.formatToParts(fecha)) {
    if (p.type !== "literal") bag[p.type] = p.value;
  }
  if (bag.hour === "24") bag.hour = "00";
  return bag;
}

/** Medianoche de ese día en Madrid, como instante UTC. */
export function inicioDiaMadrid(ancla: Date): Date {
  const p = partes(ancla);
  const dia = `${p.year}-${p.month}-${p.day}`;
  const mediodia = new Date(`${dia}T12:00:00Z`);
  const enMadrid = partes(mediodia);
  const mediodiaComoLocal = Date.parse(
    `${enMadrid.year}-${enMadrid.month}-${enMadrid.day}T${enMadrid.hour}:${enMadrid.minute}:${enMadrid.second}Z`,
  );
  const offset = mediodiaComoLocal - mediodia.getTime();
  return new Date(Date.parse(`${dia}T00:00:00Z`) - offset);
}

const DESDE_LUNES: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/** Lunes 00:00 en Madrid de la semana del instante dado. */
export function inicioSemanaMadrid(ancla: Date): Date {
  const p = partes(ancla);
  const delta = DESDE_LUNES[p.weekday] ?? 0;
  const utc = new Date(Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day)));
  utc.setUTCDate(utc.getUTCDate() - delta);
  const iso = utc.toISOString().slice(0, 10);
  return inicioDiaMadrid(new Date(`${iso}T12:00:00Z`));
}

const formato = new Intl.DateTimeFormat("es-ES", {
  timeZone: ZONA,
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatFecha(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const fecha = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(fecha.getTime())) return "—";
  return formato.format(fecha);
}
