"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  patch?: string;
}

const TABS = [
  { href: "/", label: "Lane Counter", short: "Lane" },
  { href: "/team", label: "Team Counter", short: "Team" },
];

export function NavBar({ patch }: Props) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-rift-bg/70 border-b border-rift-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-rift-gold via-rift-deep to-rift-blue flex items-center justify-center shadow-lg shadow-rift-blue/30">
            <span className="font-display text-base sm:text-lg font-black text-rift-bg">
              ⚔
            </span>
          </div>
          <div className="hidden sm:block">
            <div className="font-display text-base sm:text-lg font-bold gold-text tracking-wider leading-none">
              RIFT COUNTER
            </div>
            {patch && (
              <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-rift-goldLight/40 mt-0.5">
                Patch {patch}
              </div>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-1 glass rounded-full p-1 ml-auto">
          {TABS.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-rift-blue to-rift-deep text-white shadow-lg shadow-rift-blue/30"
                    : "text-rift-goldLight/70 hover:text-rift-gold"
                }`}
              >
                <span className="sm:hidden">{t.short}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
