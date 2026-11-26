import { redirect } from "next/navigation";

/** El encargo personalizado se pide desde contacto, con su aviso. Se mantiene la URL para quien la tenga guardada. */
export default function EncargoPage() {
  redirect("/contacto?servicio=encargo");
}
