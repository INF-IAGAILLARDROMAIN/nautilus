"use client";

import { useState, useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/bateaux", label: "Bateaux", icon: Ship },
  { href: "/dashboard/devis", label: "Devis", icon: Receipt },
  { href: "/dashboard/or", label: "Ordres de réparation", icon: Wrench },
  { href: "/dashboard/factures", label: "Factures", icon: FileText },
];

const adminItems = [
  { href: "/dashboard/admin", label: "Administration", icon: Settings },
];

const helpItems = [
  { href: "/dashboard/aide", label: "Aide & FAQ", icon: HelpCircle },
];

/**
 * Menu mobile : bouton hamburger flottant + overlay plein écran.
 * Visible uniquement < lg (1024 px). Au-dessus, la sidebar prend le relais.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  // Empêche le scroll de la page quand le menu est ouvert.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Bouton hamburger flottant — visible uniquement en mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu de navigation"
        className="lg:hidden fixed top-3 left-3 z-40 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
      >
        <Menu className="h-5 w-5" strokeWidth={2.5} />
      </button>

      {/* Overlay sombre */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panneau de navigation glissant */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex-col bg-card border-r transition-transform duration-200 ${
          open ? "translate-x-0 flex" : "-translate-x-full"
        }`}
        aria-label="Navigation mobile"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b bg-primary text-primary-foreground">
          <div className="flex items-center gap-2">
            <Anchor className="h-6 w-6" strokeWidth={2.5} />
            <span className="text-lg font-bold tracking-tight">Nautilus</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-primary-foreground/10 transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname?.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
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

          {/* Section Administration séparée */}
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
                      onClick={close}
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
                      onClick={close}
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
    </>
  );
}
