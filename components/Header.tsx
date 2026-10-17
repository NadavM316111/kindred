"use client";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { F, loadData } from "@/lib/data";
import { resetAll, update } from "@/lib/store";
import { C, FONT } from "@/lib/theme";

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: size, letterSpacing: "-0.01em", color: C.ink }}>
      <svg width={size * 1.4} height={size * 1.1} viewBox="0 0 34 26" aria-hidden="true">
        <circle cx="12" cy="13" r="10" fill={C.teal} />
        <circle cx="22" cy="13" r="10" fill="#E8836B" opacity="0.9" />
      </svg>
      Kindred
    </span>
  );
}

// Presenter keys, never shown on screen: [ and ] move a day, N jumps to the next alert, Shift+R resets.
function usePresenterKeys() {
  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const data = await loadData();
      update((s) => {
        const i = Math.max(0, data.dates.indexOf(s.demoDate));
        if (e.key === "]") return { ...s, demoDate: data.dates[Math.min(i + 1, data.dates.length - 1)] };
        if (e.key === "[") return { ...s, demoDate: data.dates[Math.max(i - 1, 0)] };
        if (e.key === "n" || e.key === "N") {
          const d = data.dates.slice(i + 1).find((x) => data.patients.some((p) => { const k = p.idx[x]; return k != null && p.days[k][F.alert]; }));
          return d ? { ...s, demoDate: d } : s;
        }
        return s;
      });
      if (e.key === "R" && e.shiftKey) resetAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

export default function Header() {
  usePresenterKeys();
  const path = usePathname() || "/";
  const coachSide = path.startsWith("/coach") || path.startsWith("/results");
  const link = (href: string, label: string) => {
    const on = path.startsWith(href);
    return (
      <Link href={href} data-tour={href === "/results" ? "accuracy" : undefined} style={{ textDecoration: "none", fontSize: 16, fontWeight: 700, color: on ? C.ink : C.mute, padding: "8px 12px", borderRadius: 10, background: on ? C.soft : "transparent" }}>{label}</Link>
    );
  };
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}`, fontFamily: FONT, paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/" style={{ textDecoration: "none" }} aria-label="Kindred home"><Logo /></Link>
        <div style={{ flex: 1 }} />
        {coachSide && <>{link("/coach", "Patients")}{link("/results", "Accuracy")}</>}
      </div>
    </header>
  );
}