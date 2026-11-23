import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false, nocache: true },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col bg-arena">{children}</div>;
}
