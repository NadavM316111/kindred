import { F, Patient } from "./data";

export type Trend = "lower" | "usual" | "higher" | "none";
export type Tile = { key: "steps" | "sleep" | "heart"; value: number | null; trend: Trend };

// Compare the last 3 days with the person's own previous 4 weeks. Plain words only.
export function bodyTiles(p: Patient, i: number): Tile[] {
  const pick = (field: number, key: Tile["key"], tol: number): Tile => {
    const recent = p.days.slice(Math.max(0, i - 2), i + 1).map((d) => d[field] as number | null).filter((v): v is number => v != null);
    const base = p.days.slice(Math.max(0, i - 30), Math.max(0, i - 2)).map((d) => d[field] as number | null).filter((v): v is number => v != null).sort((a, b) => a - b);
    const today = p.days[i][field] as number | null;
    if (!recent.length || base.length < 5) return { key, value: today, trend: "none" };
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const med = base[Math.floor(base.length / 2)];
    const ch = (avg - med) / (med || 1);
    return { key, value: today, trend: ch < -tol ? "lower" : ch > tol ? "higher" : "usual" };
  };
  return [pick(F.steps, "steps", 0.2), pick(F.sleep, "sleep", 0.1), pick(F.rhr, "heart", 0.06)];
}