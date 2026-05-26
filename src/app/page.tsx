import Link from "next/link";
import { Anchor, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header minimal */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-2 text-primary">
          <Anchor className="h-7 w-7" strokeWidth={2.5} />
          <span className="text-2xl font-bold tracking-tight">Nautilus</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Hero */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">
              Bienvenue sur Nautilus
            </h1>
            <p className="text-muted-foreground text-lg">
              L'atelier nautique connecté. Tout votre atelier, en un scan.
            </p>
          </div>

          {/* Card de connexion */}
          <Card>
            <CardHeader>
              <CardTitle>Se connecter</CardTitle>
              <CardDescription>
                Accédez à votre tableau de bord
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemple@atelier.fr"
                    className="pl-11"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="#"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-11"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button asChild className="w-full text-base font-semibold" size="lg">
                <Link href="/dashboard">Se connecter</Link>
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Pas encore de compte ?{" "}
                <Link
                  href="#"
                  className="font-medium text-primary hover:underline"
                >
                  Contacter l'atelier
                </Link>
              </p>
            </CardContent>
          </Card>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        Nautilus © 2026
      </footer>
    </div>
  );
}
