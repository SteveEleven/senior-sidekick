# SeniorSidekick

An offline-first, large-type troubleshooting assistant for seniors — one clear step at a time, with an optional handoff summary for a trusted helper.

**Live demo:** [https://senior-sidekick.vercel.app](https://senior-sidekick.vercel.app)

**Category:** Apps for Your Life (OpenAI Build Week)

## Try the demo (no setup)

1. Open the [live demo](https://senior-sidekick.vercel.app).
2. Enter: `My TV has no sound` → **Start helping me**.
3. Walk the steps: volume → mute → cable box → success or trusted-helper handoff.
4. Optional: try a different problem (routes to the “other problem” path) or **Start over**.

## How we built this (Codex + GPT-5.6)

Built for [OpenAI Build Week](https://openai.devpost.com/) with **Codex** as the primary coding agent and **GPT-5.6** as the model in that workflow.

### Codex Session ID (primary build thread)

```
019f611d-ad83-79b3-be24-445afe387151
```

Session: **“Scaffold SeniorSidekick”** (July 13, 2026) — the thread where most core functionality was built.

### Collaboration story

| Who | Role |
| --- | --- |
| **Human** | Problem framing (help for seniors when something breaks), product constraints (large type, few choices, offline-capable demo, scam-safety language), decision-tree content for “TV has no sound,” and ship decisions (MIT license, Next.js pin, public GitHub + Vercel). |
| **Codex** | Scaffolded the Next.js + Tailwind app, decision-tree model in `lib/decision-trees.ts`, UI flow in `components/senior-sidekick.tsx` (welcome → steps → success / handoff / other-problem), and iterative features (start-over, scam-safety line on handoff). |
| **GPT-5.6** | Powered the Codex build sessions. The product also reserves explicit **GPT-5.6 seams** in `lib/demo-services.ts` for (1) natural-language intent routing and (2) trusted-helper handoff summaries — stubbed with deterministic offline logic so the demo works without API keys after load. |

Key human decisions Codex executed against:

- Prefer a **guided decision tree** over a free-form chat for accessibility and predictability.
- Ship an **offline-first demo**; keep live-model call sites clearly marked for a later online mode.
- Always give an escape hatch: **handoff to someone I trust**, with copy-shareable summary and a reminder that real helpers never ask for passwords or payment.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables required for demo mode.

### Optional local GPT-5.6 test mode

The deployed app stays in deterministic demo mode. To test the two live seams locally only, copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_LIVE_GPT_56=true`, and add a server-side `OPENAI_API_KEY`. The live model may route an intent or polish a handoff summary; all troubleshooting steps remain in the human-verified decision tree. If the flag, key, or API call is unavailable, the app silently uses its existing offline behavior.

## Edit the troubleshooting tree

Change steps in `lib/decision-trees.ts`. Intent routing and handoff summary live in `lib/demo-services.ts` (offline stubs + GPT-5.6 seams).

## Deploy

```bash
npx vercel
npx vercel --prod
```

Or import [SteveEleven/senior-sidekick](https://github.com/SteveEleven/senior-sidekick) in the Vercel dashboard. Default Next.js settings work as-is.

## License

MIT — see [LICENSE](./LICENSE).
