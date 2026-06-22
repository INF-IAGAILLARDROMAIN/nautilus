"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Anchor,
  Home,
  Users,
  Ship,
  Receipt,
  Wrench,
  FileText,
  Settings,
  HelpCircle,
} from "lucide-react";

// Sidebar épurée — Option B
// Toutes les pages sont branchées à l'API (plus aucun mock).
const navItems = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/bateaux", label: "Bateaux", icon: Ship },
  { href: "/dashboard/devis", label: "Devis", icon: Receipt },
  { href: "/dashboard/or", label: "Ordres de réparation", icon: Wrench },
  { href: "/dashboard/factures", label: "Factures", icon: FileText },
];

// Section Administration — accessible à l'utilisateur admin (en V1 = utilisateur unique).
const adminItems = [
  { href: "/dashboard/admin", label: "Administration", icon: Settings },
];

// Section Aide — accessible à tous les utilisateurs.
const helpItems = [
  { href: "/dashboard/aide", label: "Aide & FAQ", icon: HelpCircle },
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

        {/* Section Administration séparée (V1 : utilisateur unique = admin) */}
        <div className="mt-6 px-3">
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Administration
          </div>
          <ul className="space-y-1">
            {adminItems.map((item) => {
              const Icon = item.icon;
              const active = pathname?.startsWith(item.href);
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
        </div>

        {/* Section Aide — accessible à tous */}
        <div className="mt-6 px-3">
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Aide
          </div>
          <ul className="space-y-1">
            {helpItems.map((item) => {
              const Icon = item.icon;
              const active = pathname?.startsWith(item.href);
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
        </div>
      </nav>

      <div className="border-t px-6 py-4 text-xs text-muted-foreground">
        Chef d&apos;atelier · Admin
      </div>
    </aside>
  );
}
