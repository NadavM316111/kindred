import type { Lang } from "./store";

// Sign-up questions. Every answer is one big tap except age.
type Opt = { value: string; label: Record<Lang, string> };
const o = (value: string, en: string, es: string, ht: string): Opt => ({ value, label: { English: en, Spanish: es, "Haitian Creole": ht } });

export const SEX: Opt[] = [o("female", "Woman", "Mujer", "Fanm"), o("male", "Man", "Hombre", "Gason")];

export const CANCER: Opt[] = [
  o("breast", "Breast", "Mama", "Tete"),
  o("lung", "Lung", "Pulmón", "Poumon"),
  o("colorectal", "Colon or rectum", "Colon o recto", "Kolon oswa rektòm"),
  o("prostate", "Prostate", "Próstata", "Pwostat"),
  o("lymphoma", "Lymphoma", "Linfoma", "Lenfòm"),
  o("leukemia", "Leukemia", "Leucemia", "Lesemi"),
  o("pancreatic", "Pancreas", "Páncreas", "Pankreyas"),
  o("ovarian", "Ovary", "Ovario", "Ovè"),
  o("head and neck", "Head and neck", "Cabeza y cuello", "Tèt ak kou"),
  o("stomach", "Stomach", "Estómago", "Vant"),
  o("other", "Other", "Otro", "Lòt"),
];

export const STAGE: Opt[] = [o("I", "1", "1", "1"), o("II", "2", "2", "2"), o("III", "3", "3", "3"), o("IV", "4", "4", "4"), o("Not sure", "Not sure", "No sé", "Mwen pa konnen")];

export const PLAN: Opt[] = [
  o("IV chemo every 21 days", "Chemo by IV", "Quimio por vena", "Chimyo nan venn"),
  o("Oral chemo, 2 weeks on 1 week off", "Chemo pills", "Quimio en pastillas", "Grenn chimyo"),
  o("Radiation, weekdays for 5 weeks", "Radiation", "Radiación", "Radyasyon"),
  o("Chemoradiation, weekdays for 6 weeks", "Chemo and radiation", "Quimio y radiación", "Chimyo ak radyasyon"),
  o("Immunotherapy every 21 days", "Immunotherapy", "Inmunoterapia", "Imino-terapi"),
  o("Hormone therapy daily", "Hormone therapy", "Terapia hormonal", "Terapi òmòn"),
  o("Not sure", "Not sure", "No sé", "Mwen pa konnen"),
];

export const ALONE: Opt[] = [o("yes", "Yes, I live alone", "Sí, vivo solo", "Wi, mwen viv poukont mwen"), o("no", "No, I live with someone", "No, vivo con alguien", "Non, mwen viv ak yon moun")];

export const MILES: Opt[] = [o("3", "Less than 5 miles", "Menos de 5 millas", "Mwens pase 5 mil"), o("10", "5 to 15 miles", "5 a 15 millas", "5 a 15 mil"), o("22", "15 to 30 miles", "15 a 30 millas", "15 a 30 mil"), o("40", "More than 30 miles", "Más de 30 millas", "Plis pase 30 mil")];

export const Q: Record<Lang, { age: string; agePh: string; sex: string; cancer: string; stage: string; plan: string; alone: string; miles: string; step: string; skip: string }> = {
  English: { age: "How old are you?", agePh: "Your age", sex: "Are you a man or a woman?", cancer: "What kind of cancer?", stage: "What stage?", plan: "What treatment are you getting?", alone: "Do you live alone?", miles: "How far is your clinic?", step: "Step {a} of {b}", skip: "Skip" },
  Spanish: { age: "¿Cuántos años tienes?", agePh: "Tu edad", sex: "¿Eres hombre o mujer?", cancer: "¿Qué tipo de cáncer?", stage: "¿Qué etapa?", plan: "¿Qué tratamiento recibes?", alone: "¿Vives solo?", miles: "¿Qué tan lejos está tu clínica?", step: "Paso {a} de {b}", skip: "Saltar" },
  "Haitian Creole": { age: "Ki laj ou?", agePh: "Laj ou", sex: "Ou se gason oswa fanm?", cancer: "Ki kalite kansè?", stage: "Ki etap?", plan: "Ki tretman w ap pran?", alone: "Èske ou viv poukont ou?", miles: "Ki distans klinik ou?", step: "Etap {a} sou {b}", skip: "Sote" },
};