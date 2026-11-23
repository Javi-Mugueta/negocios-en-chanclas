import postgres, { type Sql } from "postgres";

export type Fila = Record<string, unknown>;

export interface Consulta {
  query<T extends Fila = Fila>(texto: string, params?: readonly unknown[]): Promise<T[]>;
}

export interface BaseDatos extends Consulta {
  transaction<T>(fn: (tx: Consulta) => Promise<T>): Promise<T>;
}

/**
 * Quita `sslmode` de la URL. En clientes recientes, `sslmode=require` pide
 * verificar el certificado contra una CA pública, y el del pooler no lo está.
 * El cifrado se activa aparte, sin esa verificación.
 */
export function quitarSslMode(url: string): string {
  const sin = url
    .replace(/([?&])sslmode=[^&]*&/gi, "$1")
    .replace(/([?&])sslmode=[^&]*$/gi, "");
  return sin.endsWith("?") ? sin.slice(0, -1) : sin;
}

export function esLocal(url: string): boolean {
  return /\/\/(?:[^@/]*@)?(localhost|127\.0\.0\.1)(?::|\/|$)/i.test(url);
}

export function opcionesConexion(url: string): {
  url: string;
  options: {
    prepare: false;
    max: number;
    max_pipeline: number;
    idle_timeout: number;
    connect_timeout: number;
    fetch_types: false;
    ssl: false | { rejectUnauthorized: false };
  };
} {
  const local = esLocal(url);
  return {
    url: quitarSslMode(url),
    options: {
      prepare: false,
      max: 5,
      // Algunos poolers en modo transacción no contestan si viajan varias consultas a la vez.
      max_pipeline: 1,
      idle_timeout: 20,
      connect_timeout: 15,
      // El rol no necesita leer el catálogo de tipos.
      fetch_types: false,
      ssl: local ? false : { rejectUnauthorized: false },
    },
  };
}

const globalSql = globalThis as unknown as { necSql?: Sql };

export function getSql(): Sql {
  if (globalSql.necSql) return globalSql.necSql;
  const raw = process.env.NEC_DATABASE_URL;
  if (!raw) throw new Error("NEC_DATABASE_URL no está configurada");
  const { url, options } = opcionesConexion(raw);
  globalSql.necSql = postgres(url, options);
  return globalSql.necSql;
}

function adaptar(sql: Sql): Consulta {
  return {
    async query(texto, params = []) {
      const filas = await sql.unsafe(texto, params as never[]);
      return [...filas] as Fila[] as never;
    },
  };
}

export function getDb(): BaseDatos {
  const sql = getSql();
  return {
    ...adaptar(sql),
    transaction: (fn) => sql.begin(async (tx) => fn(adaptar(tx as unknown as Sql))),
  };
}
