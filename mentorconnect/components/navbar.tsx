import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";

async function NavAuth() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return (
      <div className="flex gap-2 items-center">
        <ThemeSwitcher />
        <Button asChild size="sm" variant="outline">
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <ThemeSwitcher />
      <UserNav email={user.email as string} />
    </div>
  );
}

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Left: Logo + Nav links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            MentorConnect
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              Home
            </Link>
            <Link
              href="/issues"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              Issues
            </Link>
          </div>
        </div>

        {/* Right: Auth / Profile */}
        <Suspense
          fallback={
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          }
        >
          <NavAuth />
        </Suspense>
      </div>
    </nav>
  );
}
