import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-white/90">Hey, {user.email}!</span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"} className="border-white/30 text-white hover:bg-white/10 hover:text-white">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" className="bg-white text-blue-700 hover:bg-blue-50">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
