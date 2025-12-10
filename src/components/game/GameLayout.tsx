"use client";

import { useGameState, type GameStageId } from "@/hooks/useGameState";
import { StageSelector } from "./StageSelector";
import { GameWorkspace } from "./GameWorkspace";
import { PipelineVisualization } from "./PipelineVisualization";
import styles from "./GameLayout.module.css";

export function GameLayout() {
  const pipelineState = useGameState((state) => state.pipelineState);
  const completedStages = useGameState((state) => state.completedStages);
  const completeStage = useGameState((state) => state.completeStage);

  const handleStageComplete = (stageId: GameStageId) => {
    completeStage(stageId);

    // Auto-advance logic
    if (!pipelineState.inputStage) {
      // Still need input - show selection
      // This is handled by GameWorkspace
    } else if (!pipelineState.llmConfigured && stageId !== "llm") {
      // Need to configure LLM
      useGameState.getState().setCurrentStage("llm");
    } else if (pipelineState.outputStages.length < 6) {
      // Need more outputs - show selection
      // This is handled by GameWorkspace
    } else {
      // All done!
      // Show completion screen
    }
  };

  const allOutputsComplete = pipelineState.outputStages.length >= 6;

  return (
    <div className={styles.gameContainer}>
      <header className={styles.header}>
        <h1>The Array ReaLLM</h1>
        <p className={styles.subtitle}>Learn How LLMs Work</p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <div className={styles.panel}>
            <div className={styles.characterPortrait}>
              <div className={styles.characterImage}>🦔</div>
              <div className={styles.characterName}>Bristle Thornweaver</div>
            </div>
          </div>

          <div className={styles.panel}>
            <StageSelector />
          </div>
        </div>

        <div className={styles.contentArea}>
          <div className={styles.pipelineCanvas}>
            <PipelineVisualization />
          </div>

          <div className={styles.workspaceContainer}>
            <GameWorkspace onStageComplete={handleStageComplete} />
          </div>
        </div>
      </div>

      {allOutputsComplete && (
        <div className={styles.completionOverlay}>
          <div className={styles.completionModal}>
            <h2>🎉 Congratulations! 🎉</h2>
            <p>You've completed all stages of the pipeline!</p>
            <p>You now understand how LLMs work by building a complete pipeline.</p>
            <button
              className={styles.btnPrimary}
              onClick={() => {
                useGameState.getState().reset();
                useGameState.getState().setShowWelcome(true);
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
