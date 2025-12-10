"use client";

import { useGameState, GAME_STAGES, type GameStageId } from "@/hooks/useGameState";
import styles from "./GameLayout.module.css";

const STAGE_ORDER: GameStageId[] = [
  "urlLoader",
  "text",
  "genie",
  "llm",
  "color",
  "icon",
  "gauge",
  "pixelArt",
  "webhook",
  "survey",
];

export function StageSelector() {
  const currentStage = useGameState((state) => state.currentStage);
  const completedStages = useGameState((state) => state.completedStages);
  const isLocked = useGameState((state) => state.isLocked);
  const setCurrentStage = useGameState((state) => state.setCurrentStage);

  const handleStageClick = (stageId: GameStageId) => {
    if (isLocked(stageId)) return;
    setCurrentStage(stageId);
  };

  return (
    <div className={styles.stageSelector}>
      <h2>Pipeline Stages</h2>
      {STAGE_ORDER.map((stageId) => {
        const stage = GAME_STAGES[stageId];
        const completed = completedStages.has(stageId);
        const active = currentStage === stageId;
        const locked = isLocked(stageId);

        return (
          <div
            key={stageId}
            className={`${styles.stageCard} ${completed ? styles.completed : ""} ${active ? styles.active : ""} ${locked ? styles.locked : ""}`}
            onClick={() => handleStageClick(stageId)}
          >
            <div className={styles.stageIcon}>{stage.icon}</div>
            <div className={styles.stageInfo}>
              <div className={styles.stageTitle}>{stage.title}</div>
              <div className={styles.stageDesc}>{stage.description}</div>
            </div>
            <div className={`${styles.badge} ${completed ? styles.earned : styles.locked}`}>
              {stage.badge}
            </div>
          </div>
        );
      })}
    </div>
  );
}
