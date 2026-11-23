import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DataType, newDb } from "pg-mem";
import type { BaseDatos, Consulta, Fila } from "@/lib/db";

export async function crearDbPrueba(): Promise<BaseDatos> {
  const mem = newDb();
  mem.public.registerFunction({
    name: "strpos",
    args: [DataType.text, DataType.text],
    returns: DataType.integer,
    implementation: (haystack: string | null, needle: string | null) => {
      if (!haystack || !needle) return 0;
      const index = haystack.indexOf(needle);
      return index < 0 ? 0 : index + 1;
    },
  });
  const { Pool } = mem.adapters.createPg();
  const pool = new Pool();
  const esquema = readFileSync(resolve(process.cwd(), "tests/esquema.sql"), "utf8");
  await pool.query(esquema);

  const consultaDe = (query: (texto: string, params?: readonly unknown[]) => Promise<{ rows: Fila[] }>): Consulta => ({
    async query<T extends Fila = Fila>(texto: string, params: readonly unknown[] = []) {
      const resultado = await query(texto, params);
      return resultado.rows as T[];
    },
  });

  return {
    ...consultaDe((texto, params) => pool.query(texto, params as unknown[])),
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const salida = await fn(
          consultaDe((texto, params) => client.query(texto, params as unknown[])),
        );
        await client.query("commit");
        return salida;
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

export async function vaciar(db: BaseDatos) {
  await db.query("delete from nec.lead_eventos");
  await db.query("delete from nec.leads");
  await db.query("delete from nec.accesos_panel");
}
