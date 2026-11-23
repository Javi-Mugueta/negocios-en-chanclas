"use client";

export default function ErrorPanel() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">No se ha podido abrir el panel</h1>
      <p className="mt-3 text-tinta/70">Recarga la página. Si sigue igual, revisa la conexión.</p>
    </div>
  );
}
