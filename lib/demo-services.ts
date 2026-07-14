import { decisionTrees } from "./decision-trees";

export type IntentResult = { treeId: string | "other"; confidence: "demo" };

const liveModeEnabled = process.env.NEXT_PUBLIC_LIVE_GPT_56 === "true";

// GPT-5.6 SEAM: intent routing — currently stubbed for offline demo
export function routeIntentOffline(problemDescription: string): IntentResult {
  const words = problemDescription.toLowerCase();
  const soundsLikeTvSound = /tv|television|sound|volume|mute|hear/.test(words);
  return {
    treeId: soundsLikeTvSound ? decisionTrees[0].id : "other",
    confidence: "demo",
  };
}

// GPT-5.6 SEAM: this is only called when live mode is explicitly enabled.
// Callers retain the offline result if the request cannot be completed.
export async function routeIntentLive(problemDescription: string): Promise<IntentResult> {
  const response = await fetch("/api/assist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "route-intent", problemDescription }),
  });

  if (!response.ok) throw new Error("Live intent routing is unavailable");
  return response.json() as Promise<IntentResult>;
}

export type TriedStep = { instruction: string; answer?: "yes" | "no" };

// GPT-5.6 SEAM: handoff summary composition — currently stubbed for offline demo
export function composeHandoffSummaryOffline({
  problemDescription,
  treeTitle,
  triedSteps,
}: {
  problemDescription: string;
  treeTitle: string;
  triedSteps: TriedStep[];
}) {
  const tried = triedSteps.length
    ? triedSteps.map((step, index) => `${index + 1}. ${step.instruction} (${step.answer === "yes" ? "said it worked" : "did not work"})`).join("\n")
    : "No troubleshooting steps were completed.";

  return `SeniorSidekick help summary\n\nProblem: ${problemDescription || treeTitle}\n\nSteps tried:\n${tried}\n\nThey would appreciate your help with the next step.\n\nReminder: only share this with someone you know and trust. Real helpers never ask for passwords or payment.`;
}

// GPT-5.6 SEAM: handoff wording only. It never generates troubleshooting steps.
export async function composeHandoffSummaryLive(offlineSummary: string): Promise<string> {
  const response = await fetch("/api/assist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "compose-handoff", offlineSummary }),
  });

  if (!response.ok) throw new Error("Live handoff composition is unavailable");
  const body = await response.json() as { summary?: unknown };
  if (typeof body.summary !== "string" || !body.summary.trim()) {
    throw new Error("Live handoff composition returned no summary");
  }
  return body.summary;
}

export function isLiveGpt56Enabled() {
  return liveModeEnabled;
}
