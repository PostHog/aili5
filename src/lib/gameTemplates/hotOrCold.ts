import { Thermometer } from "lucide-react";
import type { GameTemplate, SerializableState } from "./index";
import { generateNodeId } from "./index";

/**
 * Hot or Cold game
 * 
 * Pipeline: Genie → TextInput → GaugeDisplay → PassFail → Inference
 * 
 * How it works:
 * 1. The Mystery Keeper Genie thinks of a secret word
 * 2. Player types guesses
 * 3. Temperature gauge shows how close they are (0-100)
 * 4. Pass/Fail reveals when they get it right
 */
export function createHotOrColdPipeline(): SerializableState {
  const genieNodeId = generateNodeId();
  const textInputNodeId = generateNodeId();
  const gaugeNodeId = generateNodeId();
  const passFailNodeId = generateNodeId();
  const inferenceNodeId = generateNodeId();

  return {
    systemPromptConfig: {
      prompt: `You are the judge in a Hot or Cold guessing game!

THE GAME:
1. The Mystery Keeper has chosen a SECRET WORD
2. The player makes guesses trying to figure it out
3. You rate how "warm" they are (how close their guess is to the secret)
4. When they get it exactly right, celebrate!

YOUR TASK:
1. Look at what the Mystery Keeper's secret word is
2. Compare it to the player's guess
3. Use the display_temperature_gauge tool to show warmth (0-100):
   - 0-20: ICE COLD ❄️ (completely wrong category)
   - 21-40: COLD 🥶 (wrong but vaguely related)
   - 41-60: WARM 😊 (same category or concept)
   - 61-80: HOT 🔥 (very close, almost there!)
   - 81-99: BURNING! 🌋 (extremely close, tiny detail off)
   - 100: EXACT MATCH! 🎯
4. Use display_guess_result tool: passed=true ONLY if they got the exact word (or very close synonym)

HINTS:
- Give helpful hints based on their guess
- "Getting warmer..." or "Colder..." feedback
- If they're close, nudge them in the right direction
- Keep it fun and encouraging!

DON'T reveal the secret word unless they guess correctly!`,
    },
    nodes: [
      {
        id: genieNodeId,
        type: "genie",
        config: {
          name: "Mystery Keeper",
          backstory: `You are the Mystery Keeper! You hold secrets that players must guess.

When asked to pick a secret:
1. Choose a SINGLE WORD (noun works best)
2. Pick something that can be guessed through hints
3. Don't make it too obscure

GOOD SECRET WORDS:
- Animals: elephant, penguin, dolphin
- Objects: umbrella, telescope, piano
- Food: spaghetti, watermelon, chocolate
- Places: beach, castle, volcano
- Things: rainbow, thunder, shadow

FORMAT YOUR RESPONSE:
"🔮 I have chosen my secret! It's a [category hint like 'something you might find in nature']. 

Let the guessing begin! Type your guess and I'll tell you if you're hot or cold!"

IMPORTANT: Remember your secret word exactly so the judge can check guesses!
Secretly think: "My word is: [WORD]"`,
          model: "claude-sonnet-4-20250514",
          temperature: 1,
          autoRespondOnUpdate: false,
        },
      },
      {
        id: textInputNodeId,
        type: "text_input",
        config: {
          label: "Your Guess",
          placeholder: "What do you think the secret word is?",
        },
      },
      {
        id: gaugeNodeId,
        type: "gauge_display",
        config: {
          name: "temperature",
          label: "Temperature",
          style: "bar",
          showValue: true,
        },
      },
      {
        id: passFailNodeId,
        type: "pass_fail_display",
        config: {
          name: "guess",
          label: "Result",
          passLabel: "🎉 YOU GOT IT!",
          failLabel: "Keep guessing!",
        },
      },
      {
        id: inferenceNodeId,
        type: "inference",
        config: {
          model: "claude-sonnet-4-20250514",
          temperature: 0.6,
        },
      },
    ],
    userInputs: {
      [inferenceNodeId]: "Check my guess! How close am I?",
    },
    nodeState: {
      [`${genieNodeId}:genie:pendingPrompt`]: "Think of a secret word for me to guess!",
    },
  };
}

/**
 * Hot or Cold game template metadata
 */
export const hotOrColdTemplate: GameTemplate = {
  id: "hot-or-cold",
  name: "Hot or Cold",
  description: "Guess the secret word with temperature hints!",
  icon: Thermometer,
  difficulty: "medium",
  tags: ["guessing", "hints", "game"],
  createPipeline: createHotOrColdPipeline,
};

