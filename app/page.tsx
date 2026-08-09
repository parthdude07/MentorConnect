import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/protected");
  }

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center bg-gradient-to-r from-blue-700 to-blue-500 shadow-md h-16 dark:from-blue-950 dark:to-slate-900">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href="/" className="text-white hover:text-blue-100 transition-colors">
                CounselConnect
              </Link>
            </div>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-3xl p-5 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-700 via-blue-500 to-sky-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-blue-300 dark:to-sky-300">Connect. Learn. Grow.</h1>
          <p className="text-lg text-foreground/70 max-w-xl">
            CounselConnect bridges students with the right mentors — whether
            you&apos;re looking for academic help, career guidance, or personal growth.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link
              href="/auth/sign-up"
              className="px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25 transition-all"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 rounded-lg font-semibold border-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/50 transition-all"
            >
              Log In
            </Link>
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t border-border mx-auto text-center text-xs gap-8 py-8 text-muted-foreground">
          <p>CounselConnect &copy; {new Date().getFullYear()}</p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
