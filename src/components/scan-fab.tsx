"use client";

import { Camera } from "lucide-react";

export function ScanFab() {
  return (
    <button
      type="button"
      aria-label="Scanner la plaque moteur"
      className="
        fixed z-50
        bottom-24 right-5
        md:bottom-10 md:right-10
        h-16 w-16 md:h-18 md:w-18
        rounded-full
        bg-accent text-accent-foreground
        shadow-2xl shadow-accent/40
        flex items-center justify-center
        active:scale-95 transition-transform
        ring-4 ring-accent/20
      "
    >
      <Camera className="h-7 w-7" strokeWidth={2.5} />
      <span className="sr-only">Scanner la plaque moteur</span>
    </button>
  );
}
