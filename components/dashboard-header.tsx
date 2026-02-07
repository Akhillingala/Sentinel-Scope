"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Map, FileText } from "lucide-react";
import { CommandPalette } from "@/components/command-palette";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";

const NAV = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Map", href: "/map", icon: Map },
  { label: "AI Memos", href: "/memos", icon: FileText },
] as const;

export function DashboardHeader() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const run = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="bg-gradient-to-r from-primary to-[var(--crisis)] bg-clip-text text-lg text-transparent">
              Watershed
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map(({ label, href, icon: Icon }) => (
              <Button key={href} variant="ghost" size="sm" asChild>
                <Link href={href} className="gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="ml-2 gap-1.5 border-border/50 text-muted-foreground"
              onClick={() => setOpen(true)}
            >
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                ⌘K
              </kbd>
              Search
            </Button>
          </nav>
        </div>
      </header>
      <CommandDialog open={open} onOpenChange={setOpen} title="Navigate">
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {NAV.map(({ label, href, icon: Icon }) => (
              <CommandItem
                key={href}
                onSelect={() => run(href)}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
                <CommandShortcut>↵</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
