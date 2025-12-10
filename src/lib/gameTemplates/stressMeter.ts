import { Gauge } from "lucide-react";
import type { GameTemplate, SerializableState } from "./index";
import { generateNodeId } from "./index";

/**
 * Stress-O-Meter game
 * 
 * Pipeline: TextInput → GaugeDisplay → ColorDisplay → Inference
 * 
 * How it works:
 * 1. User vents about what's stressing them
 * 2. The LLM analyzes the stress level (0-100)
 * 3. A gauge shows the stress level
 * 4. A calming color is recommended
 */
export function createStressMeterPipeline(): SerializableState {
  const textInputNodeId = generateNodeId();
  const gaugeNodeId = generateNodeId();
  const colorNodeId = generateNodeId();
  const inferenceNodeId = generateNodeId();

  return {
    systemPromptConfig: {
      prompt: `You are a compassionate Stress Analyzer and Wellness Advisor!

YOUR TASK:
1. Read what the user shares about their stress or worries
2. Analyze their stress level from 0-100
3. Use the display_stress_gauge tool to show the stress level
4. Use the display_calm_color tool to suggest a calming color

STRESS LEVEL GUIDE:
- 0-20: Very relaxed, minimal stress
- 21-40: Low stress, manageable concerns
- 41-60: Moderate stress, noticeable tension
- 61-80: High stress, significant pressure
- 81-100: Very high stress, overwhelmed

CALMING COLOR SUGGESTIONS:
- Soft blues (#87CEEB, #B0C4DE) - for anxious minds
- Gentle greens (#90EE90, #98FB98) - for overwhelm
- Lavender (#E6E6FA, #DDA0DD) - for tension
- Warm peach (#FFDAB9, #FFE4C4) - for loneliness
- Soft pink (#FFB6C1, #FFC0CB) - for sadness

IMPORTANT:
- Be empathetic and validating
- Acknowledge their feelings
- Offer a brief, helpful perspective
- Explain why you chose that color for them
- End with an encouraging note

Remember: You're here to listen, understand, and gently support.`,
    },
    nodes: [
      {
        id: textInputNodeId,
        type: "text_input",
        config: {
          label: "What's on your mind?",
          placeholder: "Vent away... share what's stressing you out",
        },
      },
      {
        id: gaugeNodeId,
        type: "gauge_display",
        config: {
          name: "stress",
          label: "Stress Level",
          style: "dial",
          showValue: true,
        },
      },
      {
        id: colorNodeId,
        type: "color_display",
        config: {
          name: "calm",
          label: "Calming Color for You",
          showHex: true,
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
      [inferenceNodeId]: "Analyze my stress and help me feel better",
    },
    nodeState: {},
  };
}

/**
 * Stress-O-Meter game template metadata
 */
export const stressMeterTemplate: GameTemplate = {
  id: "stress-meter",
  name: "Stress-O-Meter",
  description: "Vent your worries and see your stress level with a calming color!",
  icon: Gauge,
  difficulty: "easy",
  tags: ["wellness", "stress", "meter"],
  createPipeline: createStressMeterPipeline,
};

