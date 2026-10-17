"use client";
import { useSyncExternalStore } from "react";
import { DEFAULT_DATE } from "./data";

// Everything the app saves lives in the browser, so a tap on the patient
// screen shows up on the coach screen (even in another tab).
export type Lang = "English" | "Spanish" | "Haitian Creole";
export type Profile = {
  name: string; lang: Lang; pid: string;
  age?: number; sex?: string; cancer?: string; stage?: string; plan?: string; alone?: string; miles?: number;
};
export type State = {
  demoDate: string;
  checkins: Record<string, Record<string, number>>; // patientId -> date -> 1..5
  urgent: Record<string, string[]>;                 // patientId -> dates "I don't feel well" was pressed
  called: Record<string, string[]>;                 // patientId -> dates the coach marked as called
  msgs: Record<string, string>;                     // cached AI messages
  fitbit: Record<string, boolean>;                  // patientId -> Fitbit connected (placeholder)
  profile: Profile | null;                          // the patient signed in on this device
};

const KEY = "kindred-state-v1";
const empty: State = { demoDate: DEFAULT_DATE, checkins: {}, urgent: {}, called: {}, msgs: {}, fitbit: {}, profile: null };
let state: State = empty;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...empty, ...JSON.parse(raw) };
  } catch {}
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY || !e.newValue) return;
    try { state = { ...empty, ...JSON.parse(e.newValue) }; listeners.forEach((l) => l()); } catch {}
  });
}

function save() {
  try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  listeners.forEach((l) => l());
}

export function update(fn: (s: State) => State) {
  load();
  state = fn(state);
  save();
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function useStore(): State {
  return useSyncExternalStore(subscribe, () => { load(); return state; }, () => empty);
}

export const setDemoDate = (d: string) => update((s) => ({ ...s, demoDate: d }));

export const saveCheckin = (pid: string, date: string, v: number) =>
  update((s) => ({ ...s, checkins: { ...s.checkins, [pid]: { ...(s.checkins[pid] || {}), [date]: v } } }));

export const pressUrgent = (pid: string, date: string) =>
  update((s) => ({ ...s, urgent: { ...s.urgent, [pid]: Array.from(new Set([...(s.urgent[pid] || []), date])) } }));

export const markCalled = (pid: string, date: string) =>
  update((s) => ({ ...s, called: { ...s.called, [pid]: Array.from(new Set([...(s.called[pid] || []), date])) } }));

export const cacheMsg = (k: string, v: string) => update((s) => ({ ...s, msgs: { ...s.msgs, [k]: v } }));

export const connectFitbit = (pid: string) => update((s) => ({ ...s, fitbit: { ...s.fitbit, [pid]: true } }));

export const saveProfile = (pr: Profile) => update((s) => ({ ...s, profile: pr }));

export const resetAll = () => update(() => ({ ...empty }));