import { decisionTrees } from "./decision-trees";

export type IntentResult = { treeId: string | "other"; confidence: "demo" };

// GPT-5.6 SEAM: intent routing — currently stubbed for offline demo
export function routeIntentOffline(problemDescription: string): IntentResult {
  const words = problemDescription.toLowerCase();
  const soundsLikeTvSound = /tv|television|sound|volume|mute|hear/.test(words);
  return {
    treeId: soundsLikeTvSound ? decisionTrees[0].id : "other",
    confidence: "demo",
  };
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
