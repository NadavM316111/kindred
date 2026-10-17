"use client";
import { useState } from "react";
import PatientHome from "@/components/PatientHome";
import { SIGNUP_PID, useData } from "@/lib/data";
import { T } from "@/lib/i18n";
import { ALONE, CANCER, MILES, PLAN, Q, SEX, STAGE } from "@/lib/intake";
import { Lang, Profile, connectFitbit, saveProfile, useStore } from "@/lib/store";
import { C, FONT, SHADOW } from "@/lib/theme";

const LANGS: { lang: Lang; label: string; hello: string }[] = [
  { lang: "English", label: "English", hello: "Hello" },
  { lang: "Spanish", label: "Español", hello: "Hola" },
  { lang: "Haitian Creole", label: "Kreyòl ayisyen", hello: "Bonjou" },
];

type Step = "lang" | "name" | "age" | "sex" | "cancer" | "stage" | "plan" | "alone" | "miles" | "watch";
const ORDER: Step[] = ["lang", "name", "age", "sex", "cancer", "stage", "plan", "alone", "miles", "watch"];

// Sign up one question per screen, big taps only. After that, this page is the patient's home.
export default function PatientPage() {
  const data = useData();
  const st = useStore();
  const [step, setStep] = useState<Step>("lang");
  const [form, setForm] = useState<Partial<Profile>>({ lang: "English" });
  const [age, setAge] = useState("");
  const [connecting, setConnecting] = useState(false);

  if (!data) return <Shell><p style={{ textAlign: "center", fontSize: 22, color: C.mute }}>...</p></Shell>;

  const pr = st.profile;
  if (pr && st.fitbit[pr.pid] && data.byId[pr.pid]) {
    return <Shell><PatientHome p={data.byId[pr.pid]} /></Shell>;
  }

  const lang = (form.lang || "English") as Lang;
  const t = T[lang];
  const q = Q[lang];
  const idx = ORDER.indexOf(step);
  const next = () => setStep(ORDER[Math.min(idx + 1, ORDER.length - 1)]);
  const back = () => setStep(ORDER[Math.max(idx - 1, 0)]);
  const pick = (patch: Partial<Profile>) => { setForm((f) => ({ ...f, ...patch })); next(); };
  const first = (form.name || "").trim().split(/\s+/)[0];

  const Progress = () => idx > 0 ? (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontSize: 15, color: C.mute, marginBottom: 8, textAlign: "center" }}>{q.step.replace("{a}", String(idx)).replace("{b}", String(ORDER.length - 1))}</div>
      <div style={{ height: 8, background: C.soft, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${(idx / (ORDER.length - 1)) * 100}%`, height: "100%", background: C.teal, borderRadius: 99, transition: "width 0.3s" }} />
      </div>
    </div>
  ) : null;

  const Choices = ({ title, opts, field, num }: { title: string; opts: { value: string; label: Record<Lang, string> }[]; field: keyof Profile; num?: boolean }) => (
    <Shell>
      <Progress />
      <h1 style={h1}>{title}</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
        {opts.map((op) => {
          const on = String(form[field] ?? "") === op.value;
          return (
            <button key={op.value} onClick={() => pick({ [field]: num ? Number(op.value) : op.value } as Partial<Profile>)} style={{ ...choiceBtn, borderColor: on ? C.teal : C.line, background: on ? C.tealSoft : "#fff" }}>
              {op.label[lang]}
            </button>
          );
        })}
      </div>
      <BackLink onClick={back} />
    </Shell>
  );

  if (step === "lang") {
    return (
      <Shell>
        <h1 style={{ ...h1, marginTop: 20 }}>Welcome · Bienvenido · Byenveni</h1>
        <p style={sub}>Choose your language</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {LANGS.map((l) => (
            <button key={l.lang} onClick={() => pick({ lang: l.lang })} style={{ ...choiceBtn, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 26px" }}>
              <span style={{ fontSize: 26, fontWeight: 800 }}>{l.label}</span>
              <span style={{ fontSize: 18, color: C.mute, fontWeight: 400 }}>{l.hello}</span>
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  if (step === "name") {
    const ok = (form.name || "").trim().length >= 2;
    return (
      <Shell>
        <Progress />
        <h1 style={h1}>{t.welcome}</h1>
        <p style={sub}>{t.askName}</p>
        <input autoFocus value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          onKeyDown={(e) => { if (e.key === "Enter" && ok) next(); }} placeholder={t.namePh} autoComplete="given-name" style={input} />
        <button disabled={!ok} onClick={next} style={{ ...bigBtn, marginTop: 16, background: ok ? C.teal : C.line, color: ok ? "#fff" : C.mute, cursor: ok ? "pointer" : "default" }}>{t.cont}</button>
        <BackLink onClick={back} />
      </Shell>
    );
  }

  if (step === "age") {
    const n = Number(age);
    const ok = Number.isFinite(n) && n >= 18 && n <= 110;
    return (
      <Shell>
        <Progress />
        <h1 style={h1}>{q.age}</h1>
        <input autoFocus inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))}
          onKeyDown={(e) => { if (e.key === "Enter" && ok) pick({ age: n }); }} placeholder={q.agePh} style={{ ...input, marginTop: 24, textAlign: "center", fontSize: 40 }} />
        <button disabled={!ok} onClick={() => pick({ age: n })} style={{ ...bigBtn, marginTop: 16, background: ok ? C.teal : C.line, color: ok ? "#fff" : C.mute, cursor: ok ? "pointer" : "default" }}>{t.cont}</button>
        <BackLink onClick={back} />
      </Shell>
    );
  }

  if (step === "sex") return <Choices title={q.sex} opts={SEX} field="sex" />;
  if (step === "cancer") return <Choices title={q.cancer} opts={CANCER} field="cancer" />;
  if (step === "stage") return <Choices title={q.stage} opts={STAGE} field="stage" />;
  if (step === "plan") return <Choices title={q.plan} opts={PLAN} field="plan" />;
  if (step === "alone") return <Choices title={q.alone} opts={ALONE} field="alone" />;
  if (step === "miles") return <Choices title={q.miles} opts={MILES} field="miles" num />;

  const connect = () => {
    setConnecting(true);
    setTimeout(() => {
      saveProfile({ ...(form as Profile), name: (form.name || "").trim(), lang, pid: SIGNUP_PID });
      connectFitbit(SIGNUP_PID);
      setConnecting(false);
    }, 1400);
  };

  return (
    <Shell>
      <Progress />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 24, margin: "0 0 22px", color: C.mute }}>{t.hi}, {first}</p>
        <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="58" fill={C.tealSoft} />
          <rect x="40" y="22" width="40" height="76" rx="12" fill={C.teal} />
          <rect x="45" y="38" width="30" height="44" rx="7" fill="#fff" />
          <path d="M50 62h6l3-7 4 14 3-7h4" stroke={C.teal} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 style={{ ...h1, margin: "22px 0 12px" }}>{t.connectTitle}</h1>
        <p style={{ ...sub, maxWidth: 440, margin: "0 auto 30px" }}>{t.connectBody}</p>
        <button onClick={connect} disabled={connecting} style={{ ...bigBtn, background: C.teal, color: "#fff", opacity: connecting ? 0.75 : 1 }}>
          {connecting ? t.connecting : t.connectTitle}
        </button>
        <BackLink onClick={back} />
      </div>
    </Shell>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Back" style={{ display: "flex", alignItems: "center", gap: 6, margin: "22px auto 0", background: "none", border: "none", color: C.mute, fontSize: 18, fontFamily: FONT, cursor: "pointer" }}>
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4l-6 6 6 6" stroke={C.mute} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}

const h1: React.CSSProperties = { fontSize: 34, margin: 0, textAlign: "center", lineHeight: 1.2 };
const sub: React.CSSProperties = { fontSize: 21, color: C.mute, margin: "10px 0 26px", textAlign: "center", lineHeight: 1.5 };
const bigBtn: React.CSSProperties = { width: "100%", minHeight: 76, borderRadius: 22, border: "none", fontSize: 26, fontWeight: 800, fontFamily: FONT, cursor: "pointer", padding: "18px 20px" };
const input: React.CSSProperties = { width: "100%", fontSize: 28, fontFamily: FONT, padding: "20px 22px", borderRadius: 20, border: `2px solid ${C.line}`, outline: "none", color: C.ink };
const choiceBtn: React.CSSProperties = {
  width: "100%", padding: "20px 24px", borderRadius: 20, background: "#fff", border: `2px solid ${C.line}`, boxShadow: SHADOW,
  cursor: "pointer", fontFamily: FONT, color: C.ink, fontSize: 23, fontWeight: 800, textAlign: "left",
};

function Shell({ children }: { children: React.ReactNode }) {
  return <main style={{ maxWidth: 560, margin: "0 auto", padding: "28px 18px 64px", fontFamily: FONT }}>{children}</main>;
}