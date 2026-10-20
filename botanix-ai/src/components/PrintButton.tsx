"use client";
import type { ReactNode } from "react";

export function PrintButton({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <button type="button" className="btn btn-ghost !py-2 text-sm" onClick={() => window.print()}>
      {icon} {label}
    </button>
  );
}
