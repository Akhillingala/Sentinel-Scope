import { NextResponse } from "next/server";

export async function GET() {
  // Placeholder: in production, call NLP API or Supabase for sentiment aggregates
  const data = {
    score: 0.42,
    trend: "down",
    regions: [
      { id: "sahel", name: "Sahel", score: 0.68 },
      { id: "horn", name: "Horn of Africa", score: 0.55 },
      { id: "sea", name: "Southeast Asia", score: 0.38 },
    ],
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json(data);
}
