import { Brain } from "lucide-react";
import type { GameTemplate, SerializableState } from "./index";
import { generateNodeId } from "./index";

/**
 * Trivia Master game
 * 
 * Pipeline: Genie → Survey → PassFail → ScoreDisplay → Inference
 * 
 * How it works:
 * 1. The Trivia Master Genie generates a trivia question with 4 options
 * 2. Player selects their answer via the survey
 * 3. The LLM checks if the answer is correct
 * 4. Pass/Fail shows the result, Score tracks progress
 */
export function createTriviaMasterPipeline(): SerializableState {
  const genieNodeId = generateNodeId();
  const surveyNodeId = generateNodeId();
  const passFailNodeId = generateNodeId();
  const scoreNodeId = generateNodeId();
  const inferenceNodeId = generateNodeId();

  return {
    systemPromptConfig: {
      prompt: `You are the host of a trivia game show!

YOUR TASK:
1. Look at the question the Trivia Master asked
2. Check which answer the player selected in the survey
3. Determine if they got it RIGHT or WRONG
4. Use the display_result_result tool to show pass (correct) or fail (wrong)
5. Use the display_trivia_score tool to update their score (add 1 point if correct)

IMPORTANT:
- Be enthusiastic like a game show host!
- Explain WHY the answer is correct or incorrect
- Share a fun fact related to the question
- Encourage them to keep playing!

Keep track of their running score across questions.`,
    },
    nodes: [
      {
        id: genieNodeId,
        type: "genie",
        config: {
          name: "Trivia Master",
          backstory: `You are the Trivia Master, a wise and entertaining quiz show host!

When asked for a question:
1. Generate an interesting trivia question on ANY topic (history, science, pop culture, geography, etc.)
2. Provide exactly 4 answer options labeled A, B, C, D
3. Make one answer correct and three plausible but wrong
4. Vary the difficulty - mix easy and challenging questions

CRITICAL: You MUST format your response EXACTLY like this (the Survey will parse it):

QUESTION: [Your question here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
CORRECT: [The correct letter, e.g., B]

Example:
QUESTION: What is the capital of France?
A) London
B) Paris
C) Berlin
D) Madrid
CORRECT: B

Add a fun intro before the question and encouragement after, but keep the QUESTION/A)/B)/C)/D)/CORRECT format exactly as shown!`,
          model: "claude-sonnet-4-20250514",
          temperature: 1,
          autoRespondOnUpdate: false,
        },
      },
      {
        id: surveyNodeId,
        type: "survey",
        config: {
          name: "answer",
          label: "Select Your Answer",
          style: "buttons",
          populateFromPreceding: true,
        },
      },
      {
        id: passFailNodeId,
        type: "pass_fail_display",
        config: {
          name: "result",
          label: "Result",
          passLabel: "CORRECT! 🎉",
          failLabel: "WRONG! 😅",
        },
      },
      {
        id: scoreNodeId,
        type: "score_display",
        config: {
          name: "trivia",
          label: "Your Score",
          maxScore: 10,
          showStars: true,
        },
      },
      {
        id: inferenceNodeId,
        type: "inference",
        config: {
          model: "claude-sonnet-4-20250514",
          temperature: 0.5,
        },
      },
    ],
    userInputs: {
      [inferenceNodeId]: "Check my answer!",
    },
    nodeState: {
      [`${genieNodeId}:genie:pendingPrompt`]: "Give me a trivia question!",
    },
  };
}

/**
 * Trivia Master game template metadata
 */
export const triviaMasterTemplate: GameTemplate = {
  id: "trivia-master",
  name: "Trivia Master",
  description: "Answer trivia questions and rack up points!",
  icon: Brain,
  difficulty: "medium",
  tags: ["trivia", "quiz", "knowledge"],
  createPipeline: createTriviaMasterPipeline,
};
