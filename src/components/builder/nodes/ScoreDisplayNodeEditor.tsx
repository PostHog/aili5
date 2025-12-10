"use client";

import { Star, Trophy } from "lucide-react";
import type { ScoreDisplayConfig, ScoreOutput } from "@/types/pipeline";
import type { NodeInterface, InferenceResponse } from "@/lib/nodeInterface";
import styles from "./NodeEditor.module.css";

/**
 * Score Display Node Interface
 * Implements NodeInterface for score display blocks
 */
export const ScoreDisplayNodeInterface: NodeInterface<ScoreDisplayConfig, ScoreOutput> = {
  /**
   * Generate block metadata string for system prompt
   */
  meta: (config: ScoreDisplayConfig, blockId: string): string => {
    const toolName = config.name ? `display_${config.name}_score` : "display_score";
    const label = config.label || config.name || "Score";
    const maxScore = config.maxScore ?? 100;

    return `\n\nAvailable output block:
- "${label}": ${blockId}, tool: ${toolName}

To display a score, you MUST call the ${toolName} tool with:
- score: A number from 0 to ${maxScore}
- maxScore: (optional) Maximum possible score (default: ${maxScore})
- label: (optional) What this score represents
- explanation: (optional) Why you gave this score

Use this to rate, evaluate, or score something.`;
  },

  /**
   * Parse score output from inference response
   */
  parse: (response: InferenceResponse, _blockId: string): ScoreOutput | undefined => {
    // Try to find score tool call (with or without custom name)
    if (response.toolCalls) {
      const scoreToolCall = response.toolCalls.find((tc) =>
        tc.toolName.startsWith("display_") && tc.toolName.endsWith("_score") ||
        tc.toolName === "display_score"
      );
      if (scoreToolCall && scoreToolCall.input) {
        const input = scoreToolCall.input;
        return {
          score: input.score as number,
          maxScore: input.maxScore as number | undefined,
          label: input.label as string | undefined,
          explanation: input.explanation as string | undefined,
        };
      }
    }
    return undefined;
  },
};

interface ScoreDisplayNodeEditorProps {
  config: ScoreDisplayConfig;
  onChange: (config: ScoreDisplayConfig) => void;
  output: ScoreOutput | null;
  loading?: boolean;
}

export function ScoreDisplayNodeEditor({
  config,
  onChange,
  output,
  loading = false,
}: ScoreDisplayNodeEditorProps) {
  const maxScore = output?.maxScore ?? config.maxScore ?? 100;
  const score = output?.score ?? 0;
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  
  // Determine color based on percentage
  const getScoreColor = (pct: number): string => {
    if (pct >= 80) return "#22c55e"; // green
    if (pct >= 60) return "#eab308"; // yellow
    if (pct >= 40) return "#f97316"; // orange
    return "#ef4444"; // red
  };
  
  // Calculate filled stars (out of 5)
  const filledStars = Math.round((percentage / 100) * 5);
  
  // Calculate the circumference for the progress ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const scoreColor = getScoreColor(percentage);

  return (
    <div className={styles.outputContainer}>
      {/* Config section */}
      <div className={styles.configSection}>
        <label className={styles.label}>
          Name (optional)
          <input
            type="text"
            className={styles.input}
            placeholder="e.g., creativity"
            value={config.name || ""}
            onChange={(e) => onChange({ ...config, name: e.target.value || undefined })}
          />
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={config.showStars ?? true}
            onChange={(e) => onChange({ ...config, showStars: e.target.checked })}
          />
          Show star rating
        </label>
      </div>

      {/* Output display */}
      <div className={styles.outputDisplay}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Calculating score...</span>
          </div>
        ) : output ? (
          <div className={styles.scoreDisplay}>
            <div className={styles.scoreRing}>
              <svg className={styles.progressRing} viewBox="0 0 120 120">
                <circle
                  className={styles.progressBg}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  strokeWidth="8"
                />
                <circle
                  className={styles.progressFill}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  style={{
                    stroke: scoreColor,
                    strokeDasharray: circumference,
                    strokeDashoffset,
                  }}
                />
              </svg>
              <div className={styles.scoreValue} style={{ color: scoreColor }}>
                <span className={styles.scoreNumber}>{Math.round(score)}</span>
                <span className={styles.scoreMax}>/{maxScore}</span>
              </div>
            </div>
            
            {(config.showStars ?? true) && (
              <div className={styles.starRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`${styles.star} ${star <= filledStars ? styles.starFilled : styles.starEmpty}`}
                    style={star <= filledStars ? { color: scoreColor, fill: scoreColor } : undefined}
                  />
                ))}
              </div>
            )}
            
            {output.label && (
              <span className={styles.scoreLabel}>{output.label}</span>
            )}
            {output.explanation && (
              <p className={styles.explanation}>{output.explanation}</p>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Trophy className={styles.emptyIcon} />
            <span>The model will evaluate and score your input</span>
          </div>
        )}
      </div>
    </div>
  );
}
