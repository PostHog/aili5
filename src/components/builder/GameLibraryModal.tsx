"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { GAME_TEMPLATES, type GameTemplate } from "@/lib/gameTemplates";
import { usePipelineStore } from "@/store/pipelineStore";
import styles from "./GameLibraryModal.module.css";

interface GameLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIFFICULTY_COLORS: Record<GameTemplate["difficulty"], string> = {
  easy: "#22c55e",
  medium: "#eab308",
  hard: "#ef4444",
};

export function GameLibraryModal({ isOpen, onClose }: GameLibraryModalProps) {
  const [confirmGame, setConfirmGame] = useState<GameTemplate | null>(null);
  const store = usePipelineStore();

  const handleSelectGame = (game: GameTemplate) => {
    // Check if there are existing nodes
    if (store.nodes.length > 0) {
      setConfirmGame(game);
    } else {
      loadGame(game);
    }
  };

  const loadGame = (game: GameTemplate) => {
    const pipelineState = game.createPipeline();
    store.pastePipeline(JSON.stringify(pipelineState));
    setConfirmGame(null);
    onClose();
  };

  const handleConfirmLoad = () => {
    if (confirmGame) {
      loadGame(confirmGame);
    }
  };

  const handleCancelLoad = () => {
    setConfirmGame(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Game Library" className={styles.modal}>
      {confirmGame ? (
        <div className={styles.confirmDialog}>
          <p className={styles.confirmMessage}>
            Loading &ldquo;{confirmGame.name}&rdquo; will replace your current pipeline. Continue?
          </p>
          <div className={styles.confirmButtons}>
            <button className={styles.cancelButton} onClick={handleCancelLoad}>
              Cancel
            </button>
            <button className={styles.confirmButton} onClick={handleConfirmLoad}>
              Load Game
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className={styles.description}>
            Select a game to load into the pipeline editor. Each game is a pre-built pipeline you can play and modify!
          </p>
          <div className={styles.gameGrid}>
            {GAME_TEMPLATES.map((game) => {
              const Icon = game.icon;
              return (
                <button
                  key={game.id}
                  className={styles.gameCard}
                  onClick={() => handleSelectGame(game)}
                >
                  <div className={styles.gameIcon}>
                    <Icon size={32} />
                  </div>
                  <div className={styles.gameInfo}>
                    <h3 className={styles.gameName}>{game.name}</h3>
                    <p className={styles.gameDescription}>{game.description}</p>
                    <div className={styles.gameMeta}>
                      <span
                        className={styles.difficulty}
                        style={{ color: DIFFICULTY_COLORS[game.difficulty] }}
                      >
                        {game.difficulty}
                      </span>
                      <div className={styles.tags}>
                        {game.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {GAME_TEMPLATES.length === 0 && (
            <div className={styles.emptyState}>
              <p>No games available yet. Check back soon!</p>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
