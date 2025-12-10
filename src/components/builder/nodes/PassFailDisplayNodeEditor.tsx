"use client";

import { Check, X } from "lucide-react";
import type { PassFailDisplayConfig, PassFailOutput } from "@/types/pipeline";
import type { NodeInterface, InferenceResponse } from "@/lib/nodeInterface";
import styles from "./NodeEditor.module.css";

/**
 * Pass/Fail Display Node Interface
 * Implements NodeInterface for pass/fail display blocks
 */
export const PassFailDisplayNodeInterface: NodeInterface<PassFailDisplayConfig, PassFailOutput> = {
  /**
   * Generate block metadata string for system prompt
   */
  meta: (config: PassFailDisplayConfig, blockId: string): string => {
    const toolName = config.name ? `display_${config.name}_result` : "display_result";
    const label = config.label || config.name || "Result";
    const passLabel = config.passLabel || "PASS";
    const failLabel = config.failLabel || "FAIL";

    return `\n\nAvailable output block:
- "${label}": ${blockId}, tool: ${toolName}

To display a pass/fail result, you MUST call the ${toolName} tool with:
- passed: true for ${passLabel}, false for ${failLabel}
- message: (optional) Short feedback message
- explanation: (optional) Detailed explanation of the result

Use this to indicate whether a condition was met, a guess was correct, or a task was completed successfully.`;
  },

  /**
   * Parse pass/fail output from inference response
   * Matches tools like "display_result", "display_guess_result", etc.
   */
  parse: (response: InferenceResponse, _blockId: string): PassFailOutput | undefined => {
    if (response.toolCalls && response.toolCalls.length > 0) {
      // Find the first tool call that matches the pass/fail pattern
      const resultToolCall = response.toolCalls.find((tc) => {
        const name = tc.toolName;
        // Match: display_result, display_X_result, display_anything_result
        return name === "display_result" || 
               (name.startsWith("display_") && name.endsWith("_result"));
      });
      
      if (resultToolCall && resultToolCall.input) {
        const input = resultToolCall.input;
        return {
          passed: Boolean(input.passed),
          message: input.message as string | undefined,
          explanation: input.explanation as string | undefined,
        };
      }
    }
    return undefined;
  },
};

interface PassFailDisplayNodeEditorProps {
  config: PassFailDisplayConfig;
  onChange: (config: PassFailDisplayConfig) => void;
  output: PassFailOutput | null;
  loading?: boolean;
}

export function PassFailDisplayNodeEditor({
  config,
  onChange,
  output,
  loading = false,
}: PassFailDisplayNodeEditorProps) {
  const passed = output?.passed ?? null;
  const passLabel = config.passLabel || "PASS";
  const failLabel = config.failLabel || "FAIL";

  return (
    <div className={styles.outputContainer}>
      {/* Config section */}
      <div className={styles.configSection}>
        <label className={styles.label}>
          Name (optional)
          <input
            type="text"
            className={styles.input}
            placeholder="e.g., guess"
            value={config.name || ""}
            onChange={(e) => onChange({ ...config, name: e.target.value || undefined })}
          />
        </label>
        <div className={styles.rowInputs}>
          <label className={styles.label}>
            Pass Label
            <input
              type="text"
              className={styles.input}
              placeholder="PASS"
              value={config.passLabel || ""}
              onChange={(e) => onChange({ ...config, passLabel: e.target.value || undefined })}
            />
          </label>
          <label className={styles.label}>
            Fail Label
            <input
              type="text"
              className={styles.input}
              placeholder="FAIL"
              value={config.failLabel || ""}
              onChange={(e) => onChange({ ...config, failLabel: e.target.value || undefined })}
            />
          </label>
        </div>
      </div>

      {/* Output display */}
      <div className={styles.outputDisplay}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Checking result...</span>
          </div>
        ) : output ? (
          <div className={`${styles.resultDisplay} ${passed ? styles.passed : styles.failed}`}>
            <div className={styles.resultIconWrapper}>
              {passed ? (
                <Check className={styles.resultIcon} />
              ) : (
                <X className={styles.resultIcon} />
              )}
            </div>
            
            <div className={styles.resultBanner}>
              <span className={styles.bannerText}>
                {passed ? passLabel : failLabel}
              </span>
            </div>
            
            {output.message && (
              <span className={styles.resultMessage}>{output.message}</span>
            )}
            {output.explanation && (
              <p className={styles.explanation}>{output.explanation}</p>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcons}>
              <Check className={styles.emptyIcon} style={{ color: "#22c55e" }} />
              <span className={styles.orText}>or</span>
              <X className={styles.emptyIcon} style={{ color: "#ef4444" }} />
            </div>
            <span>The model will determine pass or fail</span>
          </div>
        )}
      </div>
    </div>
  );
}
