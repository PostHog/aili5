import { Palette } from "lucide-react";
import type { GameTemplate, SerializableState } from "./index";
import { generateNodeId } from "./index";

/**
 * Mood Ring game
 * 
 * Pipeline: TextInput → ColorDisplay → Inference
 * 
 * How it works:
 * 1. User describes their day or current feelings
 * 2. The LLM analyzes the mood and picks a matching color
 * 3. The color is displayed as a "mood ring" result
 */
export function createMoodRingPipeline(): SerializableState {
  const textInputNodeId = generateNodeId();
  const colorDisplayNodeId = generateNodeId();
  const inferenceNodeId = generateNodeId();

  return {
    systemPromptConfig: {
      prompt: `You are a mystical Mood Ring that can sense emotions through words!

YOUR TASK:
1. Read what the user shares about their day or feelings
2. Analyze the underlying emotions and energy
3. Pick a color that perfectly captures their mood
4. CRITICAL: You MUST call the display_mood_color tool to show the color - this is NOT optional

COLOR MEANINGS (use these as a guide):
- Red/Orange: Energetic, passionate, excited, angry
- Yellow: Happy, optimistic, creative, anxious
- Green: Calm, balanced, growing, peaceful
- Blue: Thoughtful, sad, serene, introspective
- Purple: Mystical, creative, spiritual, dreamy
- Pink: Loving, gentle, romantic, caring
- Brown/Gray: Tired, stressed, grounded, neutral
- Black: Deep emotions, mysterious, overwhelmed
- White: Fresh start, clarity, peaceful

CRITICAL: You MUST call the display_mood_color tool EVERY SINGLE TIME. Never end your response without calling this tool.

Be poetic and insightful in your interpretation! Explain what you sense before revealing the color.`,
    },
    nodes: [
      {
        id: textInputNodeId,
        type: "text_input",
        config: {
          label: "How are you feeling today?",
          placeholder: "Tell me about your day, your mood, what's on your mind...",
        },
      },
      {
        id: colorDisplayNodeId,
        type: "color_display",
        config: {
          name: "mood",
          label: "Your Mood Color",
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
      [inferenceNodeId]: "What color matches my mood?",
    },
    nodeState: {},
  };
}

/**
 * Mood Ring game template metadata
 */
export const moodRingTemplate: GameTemplate = {
  id: "mood-ring",
  name: "Mood Ring",
  description: "Describe your feelings and get a color that matches your mood!",
  icon: Palette,
  difficulty: "easy",
  tags: ["mood", "feelings", "color"],
  createPipeline: createMoodRingPipeline,
};
