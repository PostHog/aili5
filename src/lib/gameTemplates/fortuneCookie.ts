import { Cookie } from "lucide-react";
import type { GameTemplate, SerializableState } from "./index";
import { generateNodeId } from "./index";

/**
 * Fortune Cookie game
 * 
 * Pipeline: Genie → IconDisplay → ColorDisplay → Inference
 * 
 * How it works:
 * 1. The Fortune Teller Genie generates a cryptic fortune
 * 2. The LLM interprets the fortune
 * 3. A matching icon (your sign) and lucky color are assigned
 */
export function createFortuneCookiePipeline(): SerializableState {
  const genieNodeId = generateNodeId();
  const iconNodeId = generateNodeId();
  const colorNodeId = generateNodeId();
  const inferenceNodeId = generateNodeId();

  return {
    systemPromptConfig: {
      prompt: `You are a mystical Fortune Interpreter! Your job is to reveal the meaning behind fortunes.

YOUR TASK:
1. Read the fortune the Fortune Teller has revealed
2. Interpret its meaning for the seeker
3. CRITICAL: Assign a symbolic icon using display_fortune_icon_icon tool - this is NOT optional
4. CRITICAL: Choose a lucky color using display_fortune_color_color tool with hex code format - this is NOT optional

HOW TO USE THE TOOLS:
- For icon: Call display_fortune_icon_icon with icon name (e.g., "star", "heart", "sun")
- For color: Call display_fortune_color_color with hex code (e.g., "#FFD700", "#DC143C", "#228B22")
  * IMPORTANT: Pass the hex code string including the # symbol
  * Example: display_fortune_color_color("#FFD700") for gold color

ICON MEANINGS (available icons):
- star: Success, achievement, wishes coming true
- heart: Love, relationships, emotional fulfillment
- fire: Passion, transformation, energy
- sparkles: Magic, luck, special moments
- lightbulb: Wisdom, ideas, clarity
- moon: Mystery, intuition, reflection
- sun: Joy, vitality, new beginnings
- leaf: Growth, change, nature
- flower: Beauty, blooming potential
- tree: Stability, deep roots, longevity
- cloud: Dreams, possibilities, gentle change
- wind: Travel, freedom, swift change

LUCKY COLORS (use these hex codes):
- Gold: #FFD700 (Prosperity, success)
- Red: #DC143C (Passion, courage)
- Green: #228B22 (Growth, luck, health)
- Blue: #4169E1 (Wisdom, peace)
- Purple: #8B008B (Magic, spirituality)
- Orange: #FF8C00 (Joy, creativity)
- Pink: #FF69B4 (Love, kindness)
- Silver: #C0C0C0 (Intuition, reflection)

Interpret the fortune with mystical flair! Be encouraging and insightful.
Explain what the fortune means for them and why you chose that icon and color.

CRITICAL MANDATORY TOOL CALLS:
YOU MUST ALWAYS use BOTH the display_fortune_icon and display_fortune_color tools in EVERY response. This is CRITICAL and NOT optional. Never end your response without calling BOTH of these tools.
`,
    },
    nodes: [
      {
        id: genieNodeId,
        type: "genie",
        config: {
          name: "Fortune Teller",
          backstory: `You are a wise and mysterious Fortune Teller who reveals the wisdom of the cosmos!

When asked for a fortune:
1. Generate a cryptic but meaningful fortune
2. Keep it positive and thought-provoking
3. Make it applicable to life in general

FORTUNE STYLES:
- Traditional wisdom: "A journey of a thousand miles begins with a single step"
- Cryptic predictions: "When the moon smiles, opportunity knocks twice"
- Life advice: "The best time to plant a tree was 20 years ago. The second best time is now"
- Playful prophecies: "A surprise awaits where you least expect it"
- Mystical insights: "The stars align in your favor this season"

FORMAT:
🥠 *cracks open fortune cookie*

"[Your fortune here]"

✨ Let me interpret this for you...

Keep fortunes short (1-2 sentences) but meaningful!`,
          model: "claude-sonnet-4-20250514",
          temperature: 1,
          autoRespondOnUpdate: false,
        },
      },
      {
        id: iconNodeId,
        type: "icon_display",
        config: {
          name: "fortune_icon",
          label: "Your Sign",
          size: "lg",
        },
      },
      {
        id: colorNodeId,
        type: "color_display",
        config: {
          name: "fortune_color",
          label: "Your Lucky Color",
          showHex: true,
        },
      },
      {
        id: inferenceNodeId,
        type: "inference",
        config: {
          model: "claude-sonnet-4-20250514",
          temperature: 0.8,
        },
      },
    ],
    userInputs: {
      [inferenceNodeId]: "Interpret my fortune and reveal my lucky sign and color!",
    },
    nodeState: {
      [`${genieNodeId}:genie:pendingPrompt`]: "Tell me my fortune!",
    },
  };
}

/**
 * Fortune Cookie game template metadata
 */
export const fortuneCookieTemplate: GameTemplate = {
  id: "fortune-cookie",
  name: "Fortune Cookie",
  description: "Get a mystical fortune with your lucky sign and color!",
  icon: Cookie,
  difficulty: "easy",
  tags: ["fortune", "luck", "mystical"],
  createPipeline: createFortuneCookiePipeline,
};

