import { Grid3X3 } from "lucide-react";
import type { GameTemplate, SerializableState } from "./index";
import { generateNodeId } from "./index";

/**
 * Pixel Art Studio game
 * 
 * Pipeline: Genie → PixelArtDisplay → ScoreDisplay → Inference
 * 
 * How it works:
 * 1. The Art Director Genie gives a creative theme
 * 2. The LLM creates pixel art based on the theme
 * 3. A creativity score is assigned to the creation
 */
export function createPixelArtStudioPipeline(): SerializableState {
  const genieNodeId = generateNodeId();
  const pixelArtNodeId = generateNodeId();
  const scoreNodeId = generateNodeId();
  const inferenceNodeId = generateNodeId();

  return {
    systemPromptConfig: {
      prompt: `You are a pixel art creator! Your job is to create pixel art based on themes.

YOUR TASK:
1. Look at the theme the Art Director has given
2. Create pixel art that represents that theme
3. Use the display_art_pixel_art tool to render your creation
4. Use the display_creativity_score tool to rate your own creativity (be honest but positive!)

PIXEL ART FORMAT:
- Create a grid using single characters for each pixel
- Define colors in the colors object (e.g., { "r": "#FF0000", "b": "#0000FF", ".": "transparent" })
- Build the grid array where each string is a row
- Aim for 8x8 to 16x16 grids for best results

EXAMPLE:
colors: { "r": "#FF5555", "p": "#FFAAAA", "b": "#000000", ".": "transparent" }
grid: [
  "...rr...",
  "..rrrr..",
  ".rrrrrr.",
  "rrrrrrrr",
  "rprrrprr",
  "rrrrrrrr",
  ".rr..rr.",
  "..b..b.."
]

Be creative! Simple shapes, characters, objects, or abstract art all work great.
Rate creativity based on: detail, color use, theme accuracy, and artistic flair.`,
    },
    nodes: [
      {
        id: genieNodeId,
        type: "genie",
        config: {
          name: "Art Director",
          backstory: `You are the Art Director at a pixel art studio! Your job is to inspire artists with creative themes.

When asked for a theme:
1. Give a clear, drawable concept
2. Mix simple and challenging ideas
3. Suggest a mood or style if you want

THEME IDEAS TO DRAW FROM:
- Nature: sunset, tree, flower, mountain, ocean wave
- Animals: cat face, bird, fish, butterfly
- Food: pizza slice, cupcake, ice cream cone
- Objects: heart, star, crown, key, gem
- Characters: robot face, alien, ghost, smiley
- Abstract: pattern, gradient, geometric shape

Just give the theme clearly, like:
"🎨 Today's Theme: A cute mushroom!"

Keep it fun and varied!`,
          model: "claude-sonnet-4-20250514",
          temperature: 1,
          autoRespondOnUpdate: false,
        },
      },
      {
        id: pixelArtNodeId,
        type: "pixel_art_display",
        config: {
          name: "art",
          label: "Pixel Art Creation",
          pixelSize: 24,
        },
      },
      {
        id: scoreNodeId,
        type: "score_display",
        config: {
          name: "creativity",
          label: "Creativity Score",
          maxScore: 100,
          showStars: true,
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
      [inferenceNodeId]: "Create the pixel art!",
    },
    nodeState: {
      [`${genieNodeId}:genie:pendingPrompt`]: "Give me a pixel art theme!",
    },
  };
}

/**
 * Pixel Art Studio game template metadata
 */
export const pixelArtStudioTemplate: GameTemplate = {
  id: "pixel-art-studio",
  name: "Pixel Art Studio",
  description: "Get a theme and watch AI create pixel art masterpieces!",
  icon: Grid3X3,
  difficulty: "medium",
  tags: ["art", "pixel", "creative"],
  createPipeline: createPixelArtStudioPipeline,
};

