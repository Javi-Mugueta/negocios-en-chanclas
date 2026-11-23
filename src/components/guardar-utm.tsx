"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { recordarUtm } from "@/lib/atribucion";

export function GuardarUtm() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    recordarUtm();
  }, [pathname, search]);
  return null;
}
