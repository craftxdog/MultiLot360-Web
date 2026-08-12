import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { routes } from "@/config/routes";

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck className="h-4 w-4" /></span>
            <div className="min-w-0"><p className="truncate text-sm font-medium">MultiLot 360</p><p className="truncate text-[11px] text-muted-foreground">Portal SaaS seguro</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={routes.dashboard} className="hidden h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground sm:inline-flex"><ArrowLeft className="h-3.5 w-3.5" />Centro operativo</Link>
            <ThemeToggle />
            <form action={logoutAction}><button type="submit" className="h-9 rounded-lg border border-border px-3 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground">Salir</button></form>
          </div>
        </div>
      </header>
      <div className="px-4 py-5 lg:px-6 lg:py-6">{children}</div>
    </main>
  );
}
