import { Star, Trophy } from "lucide-react";
import { PipelineNode } from "./PipelineNode";
import type { ScoreOutput } from "@/types/pipeline";
import styles from "./ScoreDisplayNode.module.css";

interface ScoreDisplayNodeProps {
  output: ScoreOutput | null;
  loading?: boolean;
  showStars?: boolean;
}

export function ScoreDisplayNode({ output, loading, showStars = true }: ScoreDisplayNodeProps) {
  const maxScore = output?.maxScore ?? 100;
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
    <PipelineNode
      title="Score Display"
      description="A score evaluation from the model"
      isLast
    >
      <div className={styles.container}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Calculating score...</span>
          </div>
        ) : output ? (
          <div className={styles.scoreDisplay}>
            <div className={styles.scoreRing}>
              <svg className={styles.progressRing} viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  className={styles.progressBg}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  strokeWidth="8"
                />
                {/* Progress circle */}
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
            
            {showStars && (
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
            
            <div className={styles.details}>
              {output.label && (
                <span className={styles.scoreLabel}>{output.label}</span>
              )}
              {output.explanation && (
                <p className={styles.explanation}>{output.explanation}</p>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Trophy className={styles.trophyIcon} />
            <span>The model will evaluate and score your input</span>
          </div>
        )}
      </div>
    </PipelineNode>
  );
}
