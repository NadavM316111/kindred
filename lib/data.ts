"use client";
import { useEffect, useState } from "react";

// One day of data, in this order:
// [date, steps, restingHR, hrv, sleepMin, feeling1to5, risk, alert, roughDay, erOrHospital, events, treatmentToday, reasons, minutesWorn]
export type Day = [
  string, number | null, number | null, number | null, number | null, number | null,
  number, number, number, number, string, number, string[], number | null
];

export const F = {
  date: 0, steps: 1, rhr: 2, hrv: 3, sleep: 4, feel: 5, risk: 6, alert: 7,
  rough: 8, acute: 9, events: 10, tx: 11, reasons: 12, worn: 13,
} as const;

export type Lang = "English" | "Spanish" | "Haitian Creole";

export type Patient = {
  id: string; age: number; sex: string; lang: Lang; cancer: string; stage: string;
  plan: string; alone: string; miles: number; days: Day[]; idx: Record<string, number>;
};

export type Metrics = {
  auc: Record<string, number>; precision: number; recall: number; base: number;
  er_caught: number; er_n: number; lead: number;
};

export type Data = { metrics: Metrics; patients: Patient[]; dates: string[]; byId: Record<string, Patient> };

export const ALERT_THRESHOLD = 0.289;
export const WATCH_THRESHOLD = 0.15;
export const DEFAULT_DATE = "2025-07-01"; // "today" inside the app
export const SIGNUP_PID = "P00065"; // new sign-ups are linked to this watch history
export const FEATURED = ["P00065", "P00653", "P00447", "P00218", "P01525", "P02417", "P00761", "P00037"];

let cache: Promise<Data> | null = null;

export function loadData(): Promise<Data> {
  if (!cache) {
    cache = fetch("/data/patients.json")
      .then((r) => r.json())
      .then((raw: { metrics: Metrics; patients: Omit<Patient, "idx">[] }) => {
        const patients: Patient[] = raw.patients.map((p) => {
          const idx: Record<string, number> = {};
          p.days.forEach((d, i) => (idx[d[0]] = i));
          return { ...p, idx };
        });
        const dates = Array.from(new Set(patients.flatMap((p) => p.days.map((d) => d[0])))).sort();
        const byId: Record<string, Patient> = {};
        patients.forEach((p) => (byId[p.id] = p));
        return { metrics: raw.metrics, patients, dates, byId };
      });
  }
  return cache;
}

export function useData(): Data | null {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => {
    let alive = true;
    loadData().then((d) => alive && setData(d));
    return () => { alive = false; };
  }, []);
  return data;
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function fmtDate(s: string, lang: Lang = "English") {
  const loc = lang === "Spanish" ? "es-US" : lang === "Haitian Creole" ? "fr-HT" : "en-US";
  return new Date(s + "T12:00:00").toLocaleDateString(loc, { weekday: "long", month: "long", day: "numeric" });
}

export function fmtShort(s: string) {
  return new Date(s + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function addDays(s: string, n: number) {
  const d = new Date(s + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}