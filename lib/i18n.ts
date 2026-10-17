import type { Lang } from "./data";
import type { Level } from "./status";

type Strings = {
  status: Record<Exclude<Level, "none">, string>;
  fallback: Record<Exclude<Level, "none">, string>;
  notActive: string;
  listen: string;
  stop: string;
  howFeel: string;
  faces: [string, string, string, string, string];
  saved: string;
  urgent: string;
  urgentSent: string;
  fitbit: string;
  fitbitOn: string;
  speechLang: string;
  hi: string;
  connectTitle: string;
  connectBody: string;
  connecting: string;
  connectedNote: string;
  yourBody: string;
  tiles: { steps: string; sleep: string; heart: string };
  units: { steps: string; hours: string; bpm: string };
  trend: { less: string; usual: string; more: string; faster: string; slower: string; none: string };
  needHelp: string;
  welcome: string;
  askName: string;
  namePh: string;
  cont: string;
  doneGood: string;
  doneBad: string;
  doneSub: string;
  change: string;
};

export const T: Record<Lang, Strings> = {
  English: {
    status: {
      green: "You're doing okay today.",
      yellow: "Take it easy the next few days.",
      red: "Your coach will call you today.",
    },
    fallback: {
      green: "Your body looks steady today. Keep up your normal routine and drink plenty of water. Call your care team if you have a fever or can't keep food down.",
      yellow: "Your body may need extra rest soon. Go slow, rest when you can, and drink fluids. Call your care team if you have a fever or can't keep food down.",
      red: "Your watch shows you may have a hard few days. Your coach will call you today to check on you. Call your care team if you have a fever or can't keep food down.",
    },
    notActive: "No data for this day.",
    listen: "Listen",
    stop: "Stop",
    howFeel: "How do you feel today?",
    faces: ["Awful", "Bad", "Okay", "Good", "Great"],
    saved: "Thank you. Your coach can see this.",
    urgent: "I don't feel well",
    urgentSent: "Your coach has been told. They will call you soon.",
    fitbit: "Connect Fitbit",
    fitbitOn: "Fitbit connected",
    speechLang: "en-US",
    hi: "Hi",
    connectTitle: "Connect your Fitbit",
    connectBody: "One tap. Your watch sends your steps, sleep and heart rate here by itself. You never have to do it again.",
    connecting: "Connecting...",
    connectedNote: "Fitbit connected",
    yourBody: "Your last 3 days",
    tiles: { steps: "Steps", sleep: "Sleep", heart: "Heart" },
    units: { steps: "steps", hours: "h", bpm: "beats a minute" },
    trend: { less: "Less than usual", usual: "Your usual", more: "More than usual", faster: "Faster than usual", slower: "Slower than usual", none: "Not enough data yet" },
    needHelp: "Need help now?",
    welcome: "Welcome to Kindred",
    askName: "What is your name?",
    namePh: "Your first name",
    cont: "Continue",
    doneGood: "Thanks, {n}. See you tomorrow.",
    doneBad: "Thank you for telling us, {n}.",
    doneSub: "You're all set for today.",
    change: "Change my answer",
  },
  Spanish: {
    status: {
      green: "Hoy vas bien.",
      yellow: "Tómalo con calma estos días.",
      red: "Tu coach te va a llamar hoy.",
    },
    fallback: {
      green: "Tu cuerpo se ve estable hoy. Sigue con tu rutina y toma mucha agua. Llama a tu equipo médico si tienes fiebre o no puedes comer.",
      yellow: "Tu cuerpo puede necesitar más descanso pronto. Ve despacio, descansa cuando puedas y toma líquidos. Llama a tu equipo médico si tienes fiebre o no puedes comer.",
      red: "Tu reloj muestra que podrías tener unos días difíciles. Tu coach te va a llamar hoy. Llama a tu equipo médico si tienes fiebre o no puedes comer.",
    },
    notActive: "No hay datos para este día.",
    listen: "Escuchar",
    stop: "Parar",
    howFeel: "¿Cómo te sientes hoy?",
    faces: ["Muy mal", "Mal", "Regular", "Bien", "Muy bien"],
    saved: "Gracias. Tu coach puede ver esto.",
    urgent: "Me siento mal",
    urgentSent: "Ya le avisamos a tu coach. Te va a llamar pronto.",
    fitbit: "Conectar Fitbit",
    fitbitOn: "Fitbit conectado",
    speechLang: "es-US",
    hi: "Hola",
    connectTitle: "Conecta tu Fitbit",
    connectBody: "Un solo toque. Tu reloj envía tus pasos, sueño y ritmo cardíaco aquí solo. No lo tienes que hacer otra vez.",
    connecting: "Conectando...",
    connectedNote: "Fitbit conectado",
    yourBody: "Tus últimos 3 días",
    tiles: { steps: "Pasos", sleep: "Sueño", heart: "Corazón" },
    units: { steps: "pasos", hours: "h", bpm: "latidos por minuto" },
    trend: { less: "Menos de lo normal", usual: "Lo normal", more: "Más de lo normal", faster: "Más rápido de lo normal", slower: "Más lento de lo normal", none: "Todavía no hay datos" },
    needHelp: "¿Necesitas ayuda ahora?",
    welcome: "Bienvenido a Kindred",
    askName: "¿Cómo te llamas?",
    namePh: "Tu nombre",
    cont: "Seguir",
    doneGood: "Gracias, {n}. Hasta mañana.",
    doneBad: "Gracias por decirnos, {n}.",
    doneSub: "Ya terminaste por hoy.",
    change: "Cambiar mi respuesta",
  },
  "Haitian Creole": {
    status: {
      green: "Ou byen jodi a.",
      yellow: "Pran li dousman kèk jou sa yo.",
      red: "Coach ou ap rele ou jodi a.",
    },
    fallback: {
      green: "Kò ou sanble estab jodi a. Kontinye fè sa ou konn fè epi bwè anpil dlo. Rele ekip swen ou si ou gen lafyèv oswa ou pa ka manje.",
      yellow: "Kò ou ka bezwen plis repo talè. Ale dousman, repoze w lè ou kapab, epi bwè likid. Rele ekip swen ou si ou gen lafyèv oswa ou pa ka manje.",
      red: "Mont ou montre ou ka gen kèk jou ki difisil. Coach ou ap rele ou jodi a. Rele ekip swen ou si ou gen lafyèv oswa ou pa ka manje.",
    },
    notActive: "Pa gen done pou jou sa a.",
    listen: "Koute",
    stop: "Rete",
    howFeel: "Kijan ou santi w jodi a?",
    faces: ["Trè mal", "Mal", "Pa pi mal", "Byen", "Trè byen"],
    saved: "Mèsi. Coach ou ka wè sa.",
    urgent: "Mwen pa santi m byen",
    urgentSent: "Nou di coach ou. L ap rele ou talè.",
    fitbit: "Konekte Fitbit",
    fitbitOn: "Fitbit konekte",
    speechLang: "fr-FR",
    hi: "Bonjou",
    connectTitle: "Konekte Fitbit ou",
    connectBody: "Yon sèl fwa. Mont ou voye pa ou, dòmi ou ak batman kè ou isit la poukont li. Ou pa bezwen fè l ankò.",
    connecting: "Ap konekte...",
    connectedNote: "Fitbit konekte",
    yourBody: "Dènye 3 jou ou yo",
    tiles: { steps: "Pa", sleep: "Dòmi", heart: "Kè" },
    units: { steps: "pa", hours: "è", bpm: "batman pa minit" },
    trend: { less: "Mwens pase nòmal", usual: "Nòmal ou", more: "Plis pase nòmal", faster: "Pi vit pase nòmal", slower: "Pi dousman pase nòmal", none: "Pa gen ase done ankò" },
    needHelp: "Ou bezwen èd kounye a?",
    welcome: "Byenveni nan Kindred",
    askName: "Ki jan ou rele?",
    namePh: "Non ou",
    cont: "Kontinye",
    doneGood: "Mèsi, {n}. N a wè demen.",
    doneBad: "Mèsi paske ou di nou sa, {n}.",
    doneSub: "Ou fini pou jodi a.",
    change: "Chanje repons mwen",
  },
};