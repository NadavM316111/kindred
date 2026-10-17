// Simple drawn faces, 1 (awful) to 5 (great). No emoji, so they look the same on every phone.
export default function Face({ v, size = 64, color }: { v: number; size?: number; color: string }) {
  const mouth: Record<number, string> = {
    1: "M20 46 Q32 34 44 46",
    2: "M21 44 Q32 39 43 44",
    3: "M21 42 L43 42",
    4: "M21 40 Q32 47 43 40",
    5: "M19 38 Q32 52 45 38",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="none" stroke={color} strokeWidth="3.5" />
      <circle cx="23" cy="26" r="3.2" fill={color} />
      <circle cx="41" cy="26" r="3.2" fill={color} />
      <path d={mouth[v]} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}