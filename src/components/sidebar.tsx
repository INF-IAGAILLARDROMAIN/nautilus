"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Anchor,
  Home,
  Receipt,
  Wrench,
  FileText,
  Calendar,
  Package,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  Snowflake,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/dashboard/devis", label: "Devis", icon: Receipt },
  { href: "/dashboard/or", label: "Ordres de réparation", icon: Wrench },
  { href: "/dashboard/factures", label: "Factures", icon: FileText },
  { href: "/dashboard/planning", label: "Planning équipe", icon: Calendar },
  { href: "/dashboard/stock", label: "Stock pièces", icon: Package },
  { href: "/dashboard/equipe", label: "Équipe", icon: Users },
  { href: "/dashboard/saisonnier", label: "Campagnes saison", icon: Snowflake },
  { href: "/dashboard/garanties", label: "Garanties", icon: ShieldCheck },
  { href: "/dashboard/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/dashboard/parametres", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r bg-card"
      aria-label="Navigation principale"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b bg-primary text-primary-foreground">
        <Anchor className="h-7 w-7" strokeWidth={2.5} />
        <span className="text-xl font-bold tracking-tight">Nautilus</span>
      </div>

      {/* Nav */}
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

      {/* Footer sidebar */}
      <div className="border-t px-6 py-4 text-xs text-muted-foreground">
        Chef d'atelier
      </div>
    </aside>
  );
}
