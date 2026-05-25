"use client";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListPageHeaderProps {
  title: string;
  subtitle?: string;
  /** Action principale à droite (ex. "+ Nouveau devis") */
  action?: {
    label: string;
    href?: string;
  };
}

export function ListPageHeader({ title, subtitle, action }: ListPageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-md">
      <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          asChild
          aria-label="Retour"
          className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-primary-foreground/80">{subtitle}</p>
          )}
        </div>
        {action && (
          <Button
            asChild
            className="bg-accent hover:bg-accent/90 text-white font-semibold h-10 shrink-0"
          >
            <Link href={action.href || "#"}>
              <Plus className="h-4 w-4 mr-1.5" />
              {action.label}
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
