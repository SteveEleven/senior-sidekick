import { NextResponse } from "next/server";

export const runtime = "nodejs";

const model = "gpt-5.6";

type RouteRequest = {
  action?: unknown;
  problemDescription?: unknown;
  offlineSummary?: unknown;
};

function liveModeIsReady() {
  return process.env.NEXT_PUBLIC_LIVE_GPT_56 === "true" && Boolean(process.env.OPENAI_API_KEY);
}

function outputText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const response = payload as { output_text?: unknown; output?: unknown };
  if (typeof response.output_text === "string") return response.output_text;
  if (!Array.isArray(response.output)) return "";

  return response.output
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) return [];
      return content.map((part) => (
        part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string"
          ? (part as { text: string }).text
          : ""
      ));
    })
    .join("");
}

async function createResponse(body: Record<string, unknown>) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, reasoning: { effort: "low" }, ...body }),
  });

  if (!response.ok) throw new Error("OpenAI response failed");
  return outputText(await response.json());
}

export async function POST(request: Request) {
  if (!liveModeIsReady()) return new NextResponse(null, { status: 404 });

  try {
    const body = await request.json() as RouteRequest;

    if (body.action === "route-intent" && typeof body.problemDescription === "string") {
      const text = await createResponse({
        instructions: "Classify the user's problem for a verified troubleshooting tree. Return tv-no-sound only when it is clearly about television sound; otherwise return other. Do not provide troubleshooting advice, steps, explanations, or extra fields.",
        input: body.problemDescription,
        text: {
          format: {
            type: "json_schema",
            name: "intent_route",
            strict: true,
            schema: {
              type: "object",
              properties: { treeId: { type: "string", enum: ["tv-no-sound", "other"] } },
              required: ["treeId"],
              additionalProperties: false,
            },
          },
        },
      });
      const parsed = JSON.parse(text) as { treeId?: unknown };
      if (parsed.treeId !== "tv-no-sound" && parsed.treeId !== "other") throw new Error("Invalid intent");
      return NextResponse.json({ treeId: parsed.treeId, confidence: "demo" });
    }

    if (body.action === "compose-handoff" && typeof body.offlineSummary === "string") {
      const summary = await createResponse({
        instructions: "Rewrite the supplied trusted-helper handoff note to be concise, clear, and warm. Preserve its facts and safety reminder. Do not add, recommend, change, or invent troubleshooting steps. Return only the ready-to-share note.",
        input: body.offlineSummary,
      });
      if (!summary.trim()) throw new Error("Empty summary");
      return NextResponse.json({ summary });
    }

    return new NextResponse(null, { status: 400 });
  } catch {
    // The browser intentionally retains its deterministic offline fallback.
    return new NextResponse(null, { status: 503 });
  }
}
