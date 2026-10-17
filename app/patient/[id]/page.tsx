"use client";
import { useParams } from "next/navigation";
import PatientHome from "@/components/PatientHome";
import { useData } from "@/lib/data";
import { C, FONT } from "@/lib/theme";

// A patient's private link. Opens straight to their screen.
export default function PatientById() {
  const { id } = useParams<{ id: string }>();
  const data = useData();
  const p = data?.byId[id];
  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "28px 18px 64px", fontFamily: FONT }}>
      {!data ? <p style={{ textAlign: "center", color: C.mute }}>...</p> : p ? <PatientHome p={p} /> : <p style={{ textAlign: "center", fontSize: 22 }}>Not found.</p>}
    </main>
  );
}