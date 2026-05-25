"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench, Receipt, FileText, Menu } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/dashboard/devis", label: "Devis", icon: Receipt },
  { href: "/dashboard/or", label: "OR", icon: Wrench },
  { href: "/dashboard/factures", label: "Factures", icon: FileText },
  { href: "/dashboard/menu", label: "Plus", icon: Menu },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navigation principale"
    >
      <ul className="flex items-center justify-around max-w-3xl mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-3 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
                <span className={`text-xs ${active ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
