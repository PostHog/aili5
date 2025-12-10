import { Sparkles } from "lucide-react";
import type { GameTemplate, SerializableState } from "./index";
import { generateNodeId } from "./index";

/**
 * Vibe Check game
 * 
 * Pipeline: Paint → EmojiDisplay → ColorDisplay → IconDisplay → Inference
 * 
 * How it works:
 * 1. User draws something to express themselves
 * 2. The LLM analyzes the "vibe" of the drawing
 * 3. Outputs: emoji (vibe), color (aura), icon (energy)
 */
export function createVibeCheckPipeline(): SerializableState {
  const paintNodeId = generateNodeId();
  const emojiNodeId = generateNodeId();
  const colorNodeId = generateNodeId();
  const iconNodeId = generateNodeId();
  const inferenceNodeId = generateNodeId();

  return {
    systemPromptConfig: {
      prompt: `You are a mystical Vibe Reader who can sense the energy in artwork!

YOUR TASK:
1. Study the drawing the user has created
2. Read the vibe, energy, and aura from their art
3. Use ALL THREE display tools to show your reading:
   - display_vibe_emoji_emoji: The overall vibe/mood
   - display_vibe_color_color: Their aura color
   - display_vibe_icon_icon: Their energy type

VIBE READING GUIDE:

EMOJIS (pick one that captures the vibe):
- 😊 Joyful, happy vibes
- 😌 Peaceful, calm energy
- 🔥 Passionate, intense vibes
- 💫 Dreamy, magical energy
- 🌊 Flowing, adaptable vibes
- ⚡ Electric, energetic vibes
- 🌸 Gentle, soft energy
- 🎭 Complex, mysterious vibes

AURA COLORS:
- Gold (#FFD700): Creative, confident
- Blue (#4169E1): Calm, thoughtful
- Green (#32CD32): Growing, balanced
- Purple (#9370DB): Mystical, intuitive
- Pink (#FF69B4): Loving, gentle
- Orange (#FF8C00): Enthusiastic, warm
- Teal (#20B2AA): Unique, independent

ENERGY ICONS (from available: check, x, warning, info, star, heart, fire, sparkles, lightbulb, moon, sun, cloud, rain, snow, wind, leaf, flower, tree):
- star: Ambitious, shining
- heart: Loving, emotional
- fire: Passionate, driven
- sparkles: Magical, creative
- lightbulb: Innovative, bright ideas
- moon: Introspective, dreamy
- sun: Positive, radiant
- leaf: Natural, grounded
- flower: Blooming, beautiful

Give a fun, mystical reading of their vibe! Be encouraging and insightful.`,
    },
    nodes: [
      {
        id: paintNodeId,
        type: "paint",
        config: {
          label: "Express yourself! Draw anything.",
        },
      },
      {
        id: emojiNodeId,
        type: "emoji_display",
        config: {
          name: "vibe_emoji",
          label: "Your Vibe",
        },
      },
      {
        id: colorNodeId,
        type: "color_display",
        config: {
          name: "vibe_color",
          label: "Your Aura Color",
          showHex: true,
        },
      },
      {
        id: iconNodeId,
        type: "icon_display",
        config: {
          name: "vibe_icon",
          label: "Your Energy",
          size: "lg",
        },
      },
      {
        id: inferenceNodeId,
        type: "inference",
        config: {
          model: "claude-sonnet-4-20250514",
          temperature: 0.9,
        },
      },
    ],
    userInputs: {
      [inferenceNodeId]: "Read my vibe!",
    },
    nodeState: {},
  };
}

/**
 * Vibe Check game template metadata
 */
export const vibeCheckTemplate: GameTemplate = {
  id: "vibe-check",
  name: "Vibe Check",
  description: "Draw something and see how AI reads your vibe, aura, and energy!",
  icon: Sparkles,
  difficulty: "easy",
  tags: ["art", "mood", "vibe"],
  createPipeline: createVibeCheckPipeline,
};

