import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import type { NodeType, OutputType } from "@/types/pipeline";
import { ICON_IDS } from "@/types/pipeline";

// ─────────────────────────────────────────────────────────────────
// Tool Definitions for Output Nodes
// ─────────────────────────────────────────────────────────────────

export const OUTPUT_TOOLS: Record<string, Tool> = {
  color: {
    name: "display_color",
    description:
      "Display a color to the user. Use this when asked to show, pick, or represent something as a color.",
    input_schema: {
      type: "object" as const,
      properties: {
        hex: {
          type: "string",
          pattern: "^#[0-9a-fA-F]{6}$",
          description: "Hex color code, e.g. #ff5500",
        },
        name: {
          type: "string",
          description: "Human-readable color name",
        },
        explanation: {
          type: "string",
          description: "Why you chose this color",
        },
      },
      required: ["hex"],
    },
  },

  icon: {
    name: "display_icon",
    description:
      "Display an icon to represent a concept, status, or emotion.",
    input_schema: {
      type: "object" as const,
      properties: {
        id: {
          type: "string",
          enum: ICON_IDS as unknown as string[],
          description: "Icon identifier",
        },
        label: {
          type: "string",
          description: "Label to show with the icon",
        },
        explanation: {
          type: "string",
          description: "Why you chose this icon",
        },
      },
      required: ["id"],
    },
  },

  gauge: {
    name: "display_gauge",
    description:
      "Display a numeric value on a gauge or meter. Use for scores, ratings, percentages, measurements.",
    input_schema: {
      type: "object" as const,
      properties: {
        value: {
          type: "number",
          description: "The numeric value to display",
        },
        min: {
          type: "number",
          description: "Minimum value (default: 0)",
        },
        max: {
          type: "number",
          description: "Maximum value (default: 100)",
        },
        unit: {
          type: "string",
          description: "Unit label, e.g. '%', '°F', 'points'",
        },
        label: {
          type: "string",
          description: "What this value represents",
        },
        explanation: {
          type: "string",
          description: "Why you chose this value",
        },
      },
      required: ["value"],
    },
  },

  pixel_art: {
    name: "generate_pixel_art",
    description:
      "Generate pixel art on a grid. Each pixel is a hex color. Pixels are listed row by row, left to right, top to bottom.",
    input_schema: {
      type: "object" as const,
      properties: {
        width: {
          type: "number",
          description: "Grid width in pixels (default: 8, max: 16)",
        },
        height: {
          type: "number",
          description: "Grid height in pixels (default: 8, max: 16)",
        },
        pixels: {
          type: "array",
          items: {
            type: "string",
            pattern: "^#[0-9a-fA-F]{6}$",
          },
          description: "Array of hex colors, length must equal width × height",
        },
        explanation: {
          type: "string",
          description: "Description of what you drew",
        },
      },
      required: ["pixels"],
    },
  },

  webhook: {
    name: "trigger_webhook",
    description:
      "Make an HTTP request to a URL. Use when asked to notify, send, or trigger external services.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          format: "uri",
          description: "The URL to request",
        },
        method: {
          type: "string",
          enum: ["GET", "POST", "PUT", "DELETE"],
          description: "HTTP method",
        },
        headers: {
          type: "object",
          description: "HTTP headers to include",
        },
        body: {
          type: "object",
          description: "Request body (for POST/PUT)",
        },
        explanation: {
          type: "string",
          description: "Why you're making this request",
        },
      },
      required: ["url", "method"],
    },
  },

  survey: {
    name: "ask_survey_question",
    description:
      "Present a multiple choice question to the user. Use for gathering preferences, guiding conversations, or creating interactive experiences.",
    input_schema: {
      type: "object" as const,
      properties: {
        question: {
          type: "string",
          description: "The question to ask",
        },
        options: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              label: { type: "string" },
            },
            required: ["id", "label"],
          },
          description: "Available choices (2-6 options)",
        },
        allowMultiple: {
          type: "boolean",
          description: "Allow selecting multiple options",
        },
        explanation: {
          type: "string",
          description: "Context for why you're asking this",
        },
      },
      required: ["question", "options"],
    },
  },
};

// ─────────────────────────────────────────────────────────────────
// Mapping Utilities
// ─────────────────────────────────────────────────────────────────

// Map node types to output types (for tool lookup)
const NODE_TYPE_TO_OUTPUT_TYPE: Partial<Record<NodeType, OutputType>> = {
  color_display: "color",
  icon_display: "icon",
  gauge_display: "gauge",
  pixel_art_display: "pixel_art",
  webhook_trigger: "webhook",
  survey: "survey",
};

// Map tool names to output types
const TOOL_NAME_TO_OUTPUT_TYPE: Record<string, OutputType> = {
  display_color: "color",
  display_icon: "icon",
  display_gauge: "gauge",
  generate_pixel_art: "pixel_art",
  trigger_webhook: "webhook",
  ask_survey_question: "survey",
};

/**
 * Get the tool definition for a given node type
 */
export function getToolForNodeType(nodeType: NodeType): Tool | null {
  const outputType = NODE_TYPE_TO_OUTPUT_TYPE[nodeType];
  if (!outputType) return null;
  return OUTPUT_TOOLS[outputType] ?? null;
}

/**
 * Convert a tool name to its output type
 */
export function toolNameToOutputType(toolName: string): OutputType | null {
  return TOOL_NAME_TO_OUTPUT_TYPE[toolName] ?? null;
}

/**
 * Get the output type for a node type
 */
export function nodeTypeToOutputType(nodeType: NodeType): OutputType | null {
  return NODE_TYPE_TO_OUTPUT_TYPE[nodeType] ?? null;
}

/**
 * Check if a node type is an output node (has an associated tool)
 */
export function isOutputNode(nodeType: NodeType): boolean {
  return nodeType in NODE_TYPE_TO_OUTPUT_TYPE;
}
