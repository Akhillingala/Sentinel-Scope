import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = (await req.json()) as { prompt: string };
  if (!prompt?.trim()) {
    return new Response(
      JSON.stringify({ error: "Missing prompt" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "OPENAI_API_KEY not configured. Add it to .env.local.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are an analyst for Watershed, a climate-conflict early warning platform. 
Respond with concise, actionable memos. Use markdown: headers, bullet points, and bold for key terms. 
Focus on risk factors, affected regions, and recommended actions.`,
    prompt,
  });

  return result.toTextStreamResponse();
}
