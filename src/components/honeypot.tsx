export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="nec_hp">No rellenar</label>
      <input id="nec_hp" name="nec_hp" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}
