"use client";

import { PipelineNode } from "./PipelineNode";
import type { ColorDisplayConfig, ColorOutput, InferenceResponse } from "@/types/pipeline";
import { parseColorFromResponse } from "@/lib/colorUtils";
import styles from "./nodes.module.css";

/**
 * Generate block metadata string for system prompt
 */
export function generateColorBlockMetadata(
  config: ColorDisplayConfig,
  blockId: string = "color-1"
): string {
  const label = config.label || "Mood Color";
  return `\n\nAvailable blocks:
- "${label}": ${blockId}, block-type: color

If the user references a block by name (label) that is a color block, return as part of the response a key-value map of colors where block id: hex value.
For example: { "${blockId}": "#ff5500" }`;
}

/**
 * Parse color output from inference response
 * Handles both tool calls and response text parsing
 */
export function parseColorOutput(
  response: InferenceResponse,
  blockId: string = "color-1"
): ColorOutput | undefined {
  // First, try to parse from tool calls
  if (response.toolCalls) {
    const colorToolCall = response.toolCalls.find((tc) => tc.name === "display_color");
    if (colorToolCall && colorToolCall.input) {
      const input = colorToolCall.input as Record<string, unknown>;
      return {
        hex: input.hex as string,
        name: input.name as string | undefined,
        explanation: input.explanation as string | undefined,
      };
    }
  }

  // Fallback: try to parse from response text
  if (response.response) {
    return parseColorFromResponse(response.response, blockId);
  }

  return undefined;
}

interface ColorDisplayNodeProps {
  config: ColorDisplayConfig;
  output?: ColorOutput;
  blockId?: string;
  loading?: boolean;
  onConfigChange?: (config: ColorDisplayConfig) => void;
}

export function ColorDisplayNode({
  config,
  output,
  blockId,
  loading = false,
  onConfigChange,
}: ColorDisplayNodeProps) {
  const handleLabelChange = (label: string) => {
    if (onConfigChange) {
      onConfigChange({ ...config, label });
    }
  };

  const handleDescriptionChange = (description: string) => {
    if (onConfigChange) {
      onConfigChange({ ...config, description });
    }
  };

  const displayLabel = config.label || "Color Display";
  const displayDescription = config.description || "Display a color chosen by the model";

  return (
    <PipelineNode title={displayLabel} description={displayDescription} blockId={blockId}>
      <div className={styles.colorContainer}>
        {/* Block Configuration */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="color-label">
            Block Name (Label)
          </label>
          <input
            id="color-label"
            type="text"
            className={styles.textarea}
            value={config.label || ""}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="e.g., Mood Color"
            style={{ minHeight: "auto", padding: "0.625rem 0.75rem" }}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="color-description">
            Description
          </label>
          <textarea
            id="color-description"
            className={styles.textarea}
            value={config.description || ""}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Describe what this color block represents..."
            rows={2}
          />
        </div>

        {/* Color Display */}
        {loading ? (
          <div className={styles.colorLoadingContainer}>
            <div className={styles.colorSwatch} style={{ background: "transparent" }}>
              <span className={styles.spinner} />
            </div>
            <div className={styles.colorLoadingText}>Waiting for color...</div>
          </div>
        ) : output?.hex ? (
          <div className={styles.colorDisplayArea}>
            {output.name && (
              <div className={styles.colorName}>{output.name}</div>
            )}
            <div
              className={styles.colorSwatch}
              style={{ backgroundColor: output.hex }}
              title={output.hex}
            />
            {config.showHex && (
              <div className={styles.colorHex}>{output.hex}</div>
            )}
            {output.explanation && (
              <div className={styles.colorExplanation}>{output.explanation}</div>
            )}
          </div>
        ) : (
          <div className={styles.colorEmptyState}>
            Waiting for a color to appear...
          </div>
        )}
      </div>
    </PipelineNode>
  );
}

