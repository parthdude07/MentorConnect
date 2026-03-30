import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                MentorConnect
              </Link>
            </div>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-3xl p-5 text-center">
          <h1 className="text-5xl font-bold text-primary">Connect. Learn. Grow.</h1>
          <p className="text-lg text-primary/80 max-w-xl">
            MentorConnect bridges students with the right mentors — whether
            you&apos;re looking for academic help, career guidance, or personal growth.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link
              href="/auth/sign-up"
              className="px-8 py-3 rounded-lg font-semibold text-white bg-primary hover:opacity-90 transition-all"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 rounded-lg font-semibold border border-border text-foreground hover:bg-accent transition-all"
            >
              Log In
            </Link>
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t border-border mx-auto text-center text-xs gap-8 py-8 text-muted-foreground">
          <p>MentorConnect &copy; {new Date().getFullYear()}</p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
