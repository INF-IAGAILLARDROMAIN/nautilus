"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, Home, Users, Ship } from "lucide-react";

// Sidebar épurée — Option B
// On ajoutera Devis / OR / Factures au fur et à mesure de leur création
// (chacune branchée à l'API, pas de mocks).
const navItems = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/bateaux", label: "Bateaux", icon: Ship },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r bg-card"
      aria-label="Navigation principale"
    >
      <div className="flex items-center gap-2 px-6 py-5 border-b bg-primary text-primary-foreground">
        <Anchor className="h-7 w-7" strokeWidth={2.5} />
        <span className="text-xl font-bold tracking-tight">Nautilus</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon
                    className="h-5 w-5 shrink-0"
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t px-6 py-4 text-xs text-muted-foreground">
        Chef d&apos;atelier
      </div>
    </aside>
  );
}
