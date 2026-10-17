import type { Patient } from "./data";
import type { State } from "./store";

// Made-up display names for the synthetic patients. The dataset itself has no names.
const FIRST: Record<string, Record<string, string[]>> = {
  English: {
    female: ["Linda", "Patricia", "Barbara", "Susan", "Karen", "Donna", "Carol", "Sharon", "Debra", "Brenda", "Pamela", "Janet", "Diane", "Gloria", "Joyce", "Ruth"],
    male: ["James", "Robert", "Michael", "William", "David", "Richard", "Thomas", "Charles", "Gary", "Larry", "Dennis", "Frank", "Raymond", "Walter", "Harold", "Gerald"],
  },
  Spanish: {
    female: ["María", "Carmen", "Rosa", "Ana", "Lucía", "Elena", "Isabel", "Teresa", "Marta", "Gloria", "Pilar", "Silvia", "Beatriz", "Mercedes", "Yolanda", "Adriana"],
    male: ["José", "Luis", "Carlos", "Jorge", "Manuel", "Rafael", "Miguel", "Pedro", "Ramón", "Alberto", "Ernesto", "Héctor", "Raúl", "Julio", "Andrés", "Mario"],
  },
  "Haitian Creole": {
    female: ["Marie", "Rose", "Nadège", "Guerline", "Lourdes", "Fabienne", "Mireille", "Ketly"],
    male: ["Jean", "Pierre", "Jacques", "Wilner", "Frantz", "Rony", "Emmanuel", "Joseph"],
  },
};
const LAST: Record<string, string[]> = {
  English: ["Carter", "Wilson", "Brooks", "Hayes", "Bennett", "Coleman", "Foster", "Graham", "Hughes", "Jenkins", "Morgan", "Porter", "Reed", "Sullivan", "Turner", "Walsh"],
  Spanish: ["González", "Rodríguez", "Pérez", "Fernández", "López", "Martínez", "Sánchez", "Ramírez", "Torres", "Díaz", "Morales", "Ortiz", "Castillo", "Herrera", "Medina", "Vargas"],
  "Haitian Creole": ["Joseph", "Pierre", "Louis", "Jean-Baptiste", "Charles", "Augustin", "Desir", "Étienne"],
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

export function nameOf(p: Pick<Patient, "id" | "sex" | "lang">) {
  const h = hash(p.id);
  const firsts = FIRST[p.lang]?.[p.sex] || FIRST.English.female;
  const lasts = LAST[p.lang] || LAST.English;
  return { first: firsts[h % firsts.length], full: `${firsts[h % firsts.length]} ${lasts[Math.floor(h / 7) % lasts.length]}` };
}

// The registered name and language win over the generated ones.
export function nameFor(p: Pick<Patient, "id" | "sex" | "lang">, st: Pick<State, "profile">) {
  const pr = st.profile;
  if (pr && pr.pid === p.id) {
    const first = pr.name.trim().split(/\s+/)[0] || pr.name;
    return { first, full: pr.name.trim() };
  }
  return nameOf(p);
}

export function langFor<P extends Pick<Patient, "id" | "lang">>(p: P, st: Pick<State, "profile">): P["lang"] {
  return st.profile && st.profile.pid === p.id ? st.profile.lang : p.lang;
}

// The patient as the app should show them: what they told us at sign-up wins over the dataset.
export function effective<P extends Patient>(p: P, st: Pick<State, "profile">): P {
  const pr = st.profile;
  if (!pr || pr.pid !== p.id) return p;
  return {
    ...p,
    lang: pr.lang,
    age: pr.age ?? p.age,
    sex: pr.sex ?? p.sex,
    cancer: pr.cancer ?? p.cancer,
    stage: pr.stage ?? p.stage,
    plan: pr.plan ?? p.plan,
    alone: pr.alone ?? p.alone,
    miles: pr.miles ?? p.miles,
  };
}