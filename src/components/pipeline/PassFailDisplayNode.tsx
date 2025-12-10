import { Check, X, HelpCircle } from "lucide-react";
import { PipelineNode } from "./PipelineNode";
import type { PassFailOutput } from "@/types/pipeline";
import styles from "./PassFailDisplayNode.module.css";

interface PassFailDisplayNodeProps {
  output: PassFailOutput | null;
  loading?: boolean;
  passLabel?: string;
  failLabel?: string;
}

export function PassFailDisplayNode({ 
  output, 
  loading, 
  passLabel = "PASS",
  failLabel = "FAIL" 
}: PassFailDisplayNodeProps) {
  const passed = output?.passed ?? null;

  return (
    <PipelineNode
      title="Pass/Fail"
      description="A pass or fail result from the model"
      isLast
    >
      <div className={styles.container}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Checking result...</span>
          </div>
        ) : output ? (
          <div className={`${styles.resultDisplay} ${passed ? styles.passed : styles.failed}`}>
            <div className={styles.iconWrapper}>
              {passed ? (
                <Check className={styles.icon} />
              ) : (
                <X className={styles.icon} />
              )}
            </div>
            
            <div className={styles.banner}>
              <span className={styles.bannerText}>
                {passed ? passLabel : failLabel}
              </span>
            </div>
            
            <div className={styles.details}>
              {output.message && (
                <span className={styles.message}>{output.message}</span>
              )}
              {output.explanation && (
                <p className={styles.explanation}>{output.explanation}</p>
              )}
            </div>
            
            {/* Decorative elements for pass state */}
            {passed && (
              <div className={styles.sparkles}>
                <div className={styles.sparkle} style={{ "--delay": "0s", "--x": "-30px", "--y": "-20px" } as React.CSSProperties} />
                <div className={styles.sparkle} style={{ "--delay": "0.1s", "--x": "30px", "--y": "-25px" } as React.CSSProperties} />
                <div className={styles.sparkle} style={{ "--delay": "0.2s", "--x": "-25px", "--y": "20px" } as React.CSSProperties} />
                <div className={styles.sparkle} style={{ "--delay": "0.3s", "--x": "35px", "--y": "15px" } as React.CSSProperties} />
              </div>
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
    </PipelineNode>
  );
}

