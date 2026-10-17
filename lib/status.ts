import { ALERT_THRESHOLD, WATCH_THRESHOLD, F, Patient, addDays } from "./data";
import type { State } from "./store";

export type Level = "red" | "yellow" | "green" | "none";

export type Status = {
  level: Level;
  risk: number;
  reasons: string[];
  dayIndex: number;
  calledToday: boolean;
  urgentToday: boolean;
  checkinToday: number | null;
};

// A red stays red for up to 3 days after the alert, until the coach marks the patient called.
export function statusFor(p: Patient, date: string, st: State): Status {
  const i = p.idx[date];
  const checkin = st.checkins[p.id]?.[date] ?? null;
  const calls = st.called[p.id] || [];
  const urg = st.urgent[p.id] || [];
  const calledToday = calls.includes(date);
  if (i == null) return { level: "none", risk: 0, reasons: [], dayIndex: -1, calledToday, urgentToday: false, checkinToday: checkin };

  const d = p.days[i];
  const risk = d[F.risk];
  const calledSince = (from: string) => calls.some((c) => c >= from && c <= date);
  const reasons: string[] = [];
  let red = false;

  // 1. Patient pressed "I don't feel well" in the last 3 days
  const recentUrgent = urg.filter((u) => u <= date && u >= addDays(date, -2));
  const urgentToday = urg.includes(date);
  if (recentUrgent.length && !calledSince(recentUrgent[recentUrgent.length - 1])) {
    red = true;
    reasons.push("Patient pressed \"I don't feel well\"");
  }

  // 2. Patient checked in feeling awful or bad today
  if (checkin != null && checkin <= 2 && !calledToday) {
    red = true;
    reasons.push(`Checked in today feeling ${checkin === 1 ? "awful" : "bad"}`);
  }

  // 3. Model alert in the last 3 days, not yet called
  for (let k = i; k >= Math.max(0, i - 2); k--) {
    const dk = p.days[k];
    if (dk[F.alert] && !calledSince(dk[F.date])) {
      red = true;
      reasons.push(...(dk[F.reasons].length ? dk[F.reasons] : ["Several small changes at once"]));
      break;
    }
  }

  const level: Level = red ? "red" : risk >= WATCH_THRESHOLD ? "yellow" : "green";
  return { level, risk, reasons: Array.from(new Set(reasons)), dayIndex: i, calledToday, urgentToday, checkinToday: checkin };
}

export const levelRank: Record<Level, number> = { red: 0, yellow: 1, green: 2, none: 3 };
export { ALERT_THRESHOLD };