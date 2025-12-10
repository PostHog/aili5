import { Pencil } from "lucide-react";
import type { GameTemplate, SerializableState } from "./index";
import { generateNodeId } from "./index";

/**
 * Pictionary / Draw & Guess game
 * 
 * Pipeline: Genie (word generator) → Paint → Pass/Fail → LLM (guesser)
 * 
 * How it works:
 * 1. A Genie generates a random thing for the player to draw
 * 2. Player draws it in the Paint module
 * 3. Pass/Fail is placed before LLM so the tool is available
 * 4. The LLM tries to guess what it is and calls the display_guess_result tool
 */
export function createPictionaryPipeline(): SerializableState {
  const genieNodeId = generateNodeId();
  const paintNodeId = generateNodeId();
  const inferenceNodeId = generateNodeId();
  const passFailNodeId = generateNodeId();

  return {
    systemPromptConfig: {
      prompt: `You are the judge in a game of Pictionary!

THE GAME:
1. The "Word Genie" has given the player a word to draw
2. The player drew it
3. Now YOU must guess what they drew by looking ONLY at the drawing
4. Then check if your guess matches the original word
5. YOU MUST ALWAYS call the display_guess_result tool to give feedback

CRITICAL MANDATORY TOOL CALL:
YOU MUST ALWAYS use the display_guess_result tool in EVERY response. This is CRITICAL and NOT optional.
- passed=true if your guess matches (or is close enough to the original word)
- passed=false if you got it wrong

YOUR RESPONSE FORMAT (REQUIRED CRITICAL):
1. Look at the drawing and say what you think it is
2. IGNORE what the Genie said - YOU are making an independent guess
3. Compare your guess to the original word
4. IMMEDIATELY call display_guess_result tool with your verdict
5. Add fun commentary after the tool call
6. Never respond to the genie don't speak to it

CRITICAL: You MUST call the display_guess_result tool EVERY SINGLE TIME. Never end your response without calling this tool.

Be fun and encouraging! Even wrong guesses should feel playful.`,
    },
    nodes: [
      {
        id: genieNodeId,
        type: "genie",
        config: {
          name: "Word Genie",
          backstory: `You are the Word Genie in a game of Pictionary! Your job is to give the player something fun to draw.

When asked for a word:
1. Pick something that's drawable (objects, animals, actions, places)
2. Keep it simple enough to draw but interesting
3. Just say the word/phrase clearly, like "A cat sleeping" or "Birthday cake" or "Playing guitar"

Mix it up between easy and medium difficulty. Be creative but drawable!

The current date and time is: ${new Date().toString()}`,
          model: "claude-sonnet-4-20250514",
          temperature: 1,
          autoRespondOnUpdate: false,
        },
      },
      {
        id: paintNodeId,
        type: "paint",
        config: {
          label: "Draw what the Word Genie said!",
        },
      },
      {
        id: passFailNodeId,
        type: "pass_fail_display",
        config: {
          name: "guess",
          label: "Guess Result",
          passLabel: "CORRECT!",
          failLabel: "NOPE!",
        },
      },
      {
        id: inferenceNodeId,
        type: "inference",
        config: {
          model: "claude-sonnet-4-20250514",
          temperature: 0.7,
        },
      },
    ],
    userInputs: {
      [inferenceNodeId]: "I finished drawing! What do you think it is?",
    },
    nodeState: {
      [`${genieNodeId}:genie:pendingPrompt`]: "Give me something to draw!",
    },
  };
}

/**
 * Pictionary game template metadata
 */
export const pictionaryTemplate: GameTemplate = {
  id: "pictionary",
  name: "Pictionary",
  description: "Get a word from the Genie, draw it, and see if the AI can guess!",
  icon: Pencil,
  difficulty: "easy",
  tags: ["drawing", "guessing", "fun"],
  createPipeline: createPictionaryPipeline,
};
