"use client";

import { useMemo, useState } from "react";
import { getTreeById, type DecisionStep, type DecisionTree } from "@/lib/decision-trees";
import { composeHandoffSummaryOffline, routeIntentOffline, type TriedStep } from "@/lib/demo-services";

type Screen = "welcome" | "step" | "success" | "handoff";

function speak(text: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
}

export function SeniorSidekick() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [description, setDescription] = useState("");
  const [tree, setTree] = useState<DecisionTree | undefined>();
  const [stepId, setStepId] = useState<string>("");
  const [triedSteps, setTriedSteps] = useState<TriedStep[]>([]);
  const [copied, setCopied] = useState(false);

  const step = useMemo(
    () => tree?.steps.find((item) => item.id === stepId),
    [tree, stepId],
  );

  function start() {
    const result = routeIntentOffline(description);
    const selected = result.treeId === "other" ? getTreeById("tv-no-sound") : getTreeById(result.treeId);
    if (!selected) return;
    setTree(selected);
    setStepId(selected.steps[0].id);
    setTriedSteps([]);
    setScreen("step");
  }

  function goTo(action: string | undefined, nextTried: TriedStep[]) {
    if (action === "handoff" || !action) {
      setTriedSteps(nextTried);
      setScreen("handoff");
      return;
    }
    if (action === "complete") {
      setTriedSteps(nextTried);
      setScreen("success");
      return;
    }
    setTriedSteps(nextTried);
    setStepId(action);
  }

  function answer(answer: "yes" | "no") {
    if (!step) return;
    const nextTried = [...triedSteps, { instruction: step.instruction, answer }];
    goTo(answer === "yes" ? step.nextOnYes : step.nextOnNo, nextTried);
  }

  function requestHelp() {
    if (step) setTriedSteps([...triedSteps, { instruction: step.instruction }]);
    setScreen("handoff");
  }

  const summary = composeHandoffSummaryOffline({
    problemDescription: description,
    treeTitle: tree?.title ?? "Technical problem",
    triedSteps,
  });

  async function shareSummary() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "SeniorSidekick help summary", text: summary });
        return;
      } catch {
        // The person may close the share sheet; copying remains available below.
      }
    }
    await copySummary();
  }

  async function copySummary() {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
  }

  function startOver() {
    setDescription("");
    setTree(undefined);
    setStepId("");
    setTriedSteps([]);
    setScreen("welcome");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-8">
      <section className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-xl shadow-sky-200/60 sm:p-10" aria-live="polite">
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-calm text-2xl" aria-hidden="true">♥</div>
          <div>
            <h1 className="text-2xl font-bold text-navy">SeniorSidekick</h1>
            <p className="text-base text-slate-600">Simple help, one step at a time</p>
          </div>
        </header>

        {screen === "welcome" && (
          <div>
            <h2 className="max-w-xl text-3xl font-bold leading-tight text-navy sm:text-4xl">What would you like help with?</h2>
            <p className="mt-4 text-xl leading-relaxed text-slate-700">Tell me what is happening. For this demo, try: “My TV has no sound.”</p>
            <label className="sr-only" htmlFor="problem">Describe the problem</label>
            <textarea id="problem" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="For example: My TV has no sound" className="mt-6 min-h-32 w-full rounded-2xl border-2 border-slate-300 p-4 text-xl text-navy placeholder:text-slate-400" />
            <button type="button" onClick={start} className="mt-5 min-h-16 w-full rounded-2xl bg-calm px-6 text-2xl font-bold text-white hover:bg-[#105e86]">Start helping me</button>
            <p className="mt-4 text-center text-base text-slate-500">Demo mode — works without an internet connection after the page is loaded.</p>
          </div>
        )}

        {screen === "step" && step && (
          <div>
            <p className="text-lg font-semibold text-calm">Helping with: {tree?.title}</p>
            <div className="mt-5 rounded-3xl bg-sky p-6 sm:p-8">
              <p className="text-3xl font-bold leading-snug text-navy sm:text-4xl">{step.instruction}</p>
              <button type="button" onClick={() => speak(`${step.instruction} ${step.question ?? ""}`)} className="mt-6 rounded-xl border-2 border-calm bg-white px-5 py-3 text-xl font-bold text-calm hover:bg-sky">🔊 Read this aloud</button>
            </div>
            {step.question ? (
              <div className="mt-7">
                <h2 className="text-2xl font-bold text-navy sm:text-3xl">{step.question}</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <button type="button" onClick={() => answer("yes")} className="min-h-20 rounded-2xl bg-[#23834c] px-6 text-3xl font-bold text-white hover:bg-[#17683a]">Yes</button>
                  <button type="button" onClick={() => answer("no")} className="min-h-20 rounded-2xl bg-[#c64a3b] px-6 text-3xl font-bold text-white hover:bg-[#a6382b]">No</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => goTo(step.nextOnYes, [...triedSteps, { instruction: step.instruction }])} className="mt-7 min-h-20 w-full rounded-2xl bg-calm px-6 text-3xl font-bold text-white">I did that</button>
            )}
            <button type="button" onClick={requestHelp} className="mt-7 w-full rounded-xl px-5 py-4 text-xl font-bold text-calm underline hover:text-navy">I need help from someone I trust</button>
          </div>
        )}

        {screen === "success" && (
          <div className="text-center">
            <div className="text-6xl" aria-hidden="true">🎉</div>
            <h2 className="mt-5 text-4xl font-bold text-navy">Wonderful — it&apos;s working!</h2>
            <p className="mt-4 text-xl text-slate-700">You did it. If the problem comes back, you can start again.</p>
            <button type="button" onClick={startOver} className="mt-8 min-h-16 w-full rounded-2xl bg-calm px-6 text-2xl font-bold text-white">Start a new problem</button>
          </div>
        )}

        {screen === "handoff" && (
          <div>
            <h2 className="text-4xl font-bold leading-tight text-navy">Let&apos;s ask someone you trust.</h2>
            <p className="mt-4 text-xl leading-relaxed text-slate-700">I made a short note of what you tried. You can share or copy it below.</p>
            <label className="sr-only" htmlFor="summary">Help summary</label>
            <textarea id="summary" readOnly value={summary} className="mt-6 min-h-56 w-full rounded-2xl border-2 border-slate-300 bg-slate-50 p-5 text-lg leading-relaxed text-navy" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <button type="button" onClick={shareSummary} className="min-h-16 rounded-2xl bg-calm px-5 text-2xl font-bold text-white">Share summary</button>
              <button type="button" onClick={copySummary} className="min-h-16 rounded-2xl border-2 border-calm bg-white px-5 text-2xl font-bold text-calm">{copied ? "Copied!" : "Copy summary"}</button>
            </div>
            <button type="button" onClick={startOver} className="mt-7 w-full rounded-xl px-5 py-3 text-xl font-bold text-calm underline">Start a new problem</button>
          </div>
        )}
      </section>
    </main>
  );
}
