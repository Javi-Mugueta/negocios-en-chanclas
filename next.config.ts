import type { NextConfig } from "next";
import { cabecerasSeguridad } from "./src/lib/seguridad";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  headers: () => cabecerasSeguridad(),
};

export default nextConfig;
