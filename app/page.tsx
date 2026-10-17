import Link from "next/link";
import { Logo } from "@/components/Header";
import { C, FONT, SHADOW } from "@/lib/theme";

const choice: React.CSSProperties = {
  flex: "1 1 280px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
  padding: "40px 24px", borderRadius: 28, border: `1px solid ${C.line}`, background: "#fff", boxShadow: SHADOW,
  textDecoration: "none", color: C.ink, minHeight: 250,
};

export default function Start() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "56px 20px", fontFamily: FONT, textAlign: "center" }}>
      <Logo size={40} />
      <p style={{ fontSize: 21, color: C.mute, margin: "16px auto 44px", maxWidth: 520, lineHeight: 1.5 }}>
        We catch the hard days early, so your care team can reach you first.
      </p>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <Link href="/patient" style={choice}>
          <svg width="84" height="84" viewBox="0 0 88 88" aria-hidden="true">
            <circle cx="44" cy="44" r="42" fill={C.tealSoft} />
            <circle cx="44" cy="34" r="13" fill={C.teal} />
            <path d="M20 70c3-13 13-20 24-20s21 7 24 20" fill={C.teal} />
          </svg>
          <span style={{ fontSize: 30, fontWeight: 800 }}>I’m a patient</span>
          <span style={{ fontSize: 17, color: C.mute }}>Soy paciente · Mwen se pasyan</span>
        </Link>
        <Link href="/coach" style={choice}>
          <svg width="84" height="84" viewBox="0 0 88 88" aria-hidden="true">
            <circle cx="44" cy="44" r="42" fill="#FBE9E4" />
            <rect x="24" y="22" width="40" height="46" rx="6" fill="#fff" stroke={C.ink} strokeWidth="3" />
            <path d="M32 36h24M32 46h24M32 56h14" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
            <circle cx="62" cy="62" r="9" fill={C.red} />
          </svg>
          <span style={{ fontSize: 30, fontWeight: 800 }}>I’m a coach</span>
          <span style={{ fontSize: 17, color: C.mute }}>See who needs a call today</span>
        </Link>
      </div>
      
    </main>
  );
}