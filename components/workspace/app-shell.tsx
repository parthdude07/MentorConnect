"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Bell,
  BarChart3,
  ClipboardList,
  GraduationCap,
  Home,
  Menu,
  MessageSquare,
  Search,
  Shield,
  Users,
  X,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { useMemo, useState } from "react";

type AppShellProps = {
  children: React.ReactNode;
  userEmail?: string;
  showAdmin?: boolean;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/protected", label: "Dashboard", icon: Home },
  { href: "/protected/mentor-rooms", label: "Group Chats", icon: Users },
  { href: "/issues", label: "Issues", icon: AlertCircle },
  { href: "/protected/mentors", label: "Mentors", icon: GraduationCap },
  { href: "/protected/discussions", label: "Direct Chats", icon: MessageSquare },
  { href: "/protected/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/protected/feedback", label: "Feedback", icon: BookOpen },
  { href: "/protected/reports", label: "Reports & Analytics", icon: BarChart3 },
  { href: "/protected/admin", label: "Admin Panel", icon: Shield, adminOnly: true },
];

const aiQuickActions = [
  "Summarize unresolved issues",
  "Suggest this week's discussion prompts",
  "Recommend support response for flagged feedback",
];

function SidebarNav({
  pathname,
  showAdmin,
  onNavigate,
}: {
  pathname: string;
  showAdmin: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1 p-3" aria-label="Sidebar Navigation">
      {navItems
        .filter((item) => !item.adminOnly || showAdmin)
        .map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/protected" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm transition-colors",
                active
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                  : "text-muted-foreground hover:bg-blue-50/60 hover:text-foreground dark:hover:bg-blue-950/30",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.adminOnly ? (
                <Badge variant="outline" className="ml-auto text-[10px]">
                  Authority
                </Badge>
              ) : null}
            </Link>
          );
        })}
    </nav>
  );
}

function ProfileMenu({ userEmail }: { userEmail?: string }) {
  const router = useRouter();
  const profileMenuTriggerId = "profile-menu-trigger";
  const profileMenuContentId = "profile-menu-content";

  const initials = useMemo(() => {
    if (!userEmail) return "MC";
    return userEmail.slice(0, 2).toUpperCase();
  }, [userEmail]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          id={profileMenuTriggerId}
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-xs font-semibold text-white"
          aria-label="Open profile menu"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        id={profileMenuContentId}
        align="end"
        className="w-56"
        aria-labelledby={profileMenuTriggerId}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Signed in as
        </DropdownMenuLabel>
        <DropdownMenuLabel className="truncate font-medium">
          {userEmail ?? "CounselConnect@local"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/reports">Analytics</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children, userEmail, showAdmin = true }: AppShellProps) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-blue-700/20 bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-md dark:from-blue-950 dark:to-slate-900 dark:border-blue-800/40">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/10"
            aria-label={mobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={() => setMobileSidebarOpen((value) => !value)}
          >
            {mobileSidebarOpen ? <X className="h-4 w-4 text-white" /> : <Menu className="h-4 w-4 text-white" />}
          </Button>

          <Link href="/protected" className="font-mono text-sm font-semibold tracking-tight text-white flex items-center gap-2">
            <Image 
              src="/icon.png" 
              alt="CounselConnect Logo" 
              width={24} 
              height={24} 
              className="rounded-md object-contain bg-white/10"
            />
            CounselConnect
          </Link>

          <div className="relative ml-1 hidden max-w-xl flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200" />
            <input
              aria-label="Global search"
              placeholder="Search issues, mentors, mentees..."
              className="h-9 w-full rounded-md border border-white/20 bg-white/10 pl-9 pr-3 text-sm text-white placeholder:text-blue-200 focus:bg-white/20 focus:outline-none"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative text-white hover:bg-white/10">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-yellow-400" />
            </Button>
            <ThemeSwitcher />
            <ProfileMenu userEmail={userEmail} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        <aside className="hidden border-r border-blue-100 bg-gradient-to-b from-blue-50/80 to-transparent dark:from-blue-950/30 dark:border-blue-900/30 lg:block">
          <SidebarNav pathname={pathname} showAdmin={showAdmin} />
        </aside>

        {mobileSidebarOpen ? (
          <div className="fixed inset-0 z-30 bg-background/60 lg:hidden" onClick={() => setMobileSidebarOpen(false)}>
            <aside
              className="h-full w-72 border-r bg-background"
              onClick={(event) => event.stopPropagation()}
            >
              <SidebarNav
                pathname={pathname}
                showAdmin={showAdmin}
                onNavigate={() => setMobileSidebarOpen(false)}
              />
            </aside>
          </div>
        ) : null}

        <main className="min-h-[calc(100vh-56px)] border-r p-4 md:p-6">{children}</main>

        <aside className="hidden p-4 xl:block">
          <div className="sticky top-[72px] space-y-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-4 shadow-sm dark:from-blue-950/40 dark:to-slate-900/40 dark:border-blue-900/30">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm font-semibold">AI Assistant</h2>
              <Badge variant="secondary">Beta</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Chat support for issue summaries, mentoring prompts, and mental wellness suggestions.
            </p>

            <div className="space-y-2">
              {aiQuickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="w-full rounded-md border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-accent"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
