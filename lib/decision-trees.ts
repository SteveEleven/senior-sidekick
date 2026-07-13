/**
 * EDIT THIS FILE to replace the demo troubleshooting content.
 * Each tree is an ordered set of named steps. A `nextOnYes` / `nextOnNo` value
 * may point to another step id, "handoff", or "complete".
 */

export type NextAction = string | "handoff" | "complete";

export type DecisionStep = {
  id: string;
  instruction: string;
  question?: string;
  nextOnYes?: NextAction;
  nextOnNo?: NextAction;
  handoff?: boolean;
};

export type DecisionTree = {
  id: string;
  title: string;
  steps: DecisionStep[];
};

export const decisionTrees: DecisionTree[] = [
  {
    id: "tv-no-sound",
    title: "TV has no sound",
    steps: [
      {
        id: "check-volume",
        instruction: "Pick up the TV remote. Press the volume-up button a few times.",
        question: "Can you hear sound now?",
        nextOnYes: "complete",
        nextOnNo: "check-mute",
      },
      {
        id: "check-mute",
        instruction: "Look for a button with a speaker and a line through it. Press it once.",
        question: "Can you hear sound now?",
        nextOnYes: "complete",
        nextOnNo: "check-cable",
      },
      {
        id: "check-cable",
        instruction: "Please check that the power light is on for any small cable box near your TV.",
        question: "Did that solve the problem?",
        nextOnYes: "complete",
        nextOnNo: "handoff",
        handoff: true,
      },
    ],
  },
];

export function getTreeById(id: string) {
  return decisionTrees.find((tree) => tree.id === id);
}
