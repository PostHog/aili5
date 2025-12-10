"use client";

import { useEffect, useRef } from "react";
import { useGameState, GAME_STAGES, type GameStageId } from "@/hooks/useGameState";
import styles from "./GameLayout.module.css";

export function PipelineVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pipelineState = useGameState((state) => state.pipelineState);
  const completedStages = useGameState((state) => state.completedStages);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, width, height);

    // Draw background pattern
    ctx.fillStyle = "rgba(74, 154, 255, 0.05)";
    for (let i = 0; i < 50; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }

    // Center point for circular layout
    const centerX = width / 2;
    const centerY = height / 2 + 20;
    const radius = 200;

    // Calculate positions
    const segments: Array<{
      x: number;
      y: number;
      type: string;
      stage?: string;
      angle: number;
    }> = [];

    // Input at top (12 o'clock)
    if (pipelineState.inputStage) {
      segments.push({
        x: centerX,
        y: centerY - radius,
        type: "input",
        stage: pipelineState.inputStage,
        angle: -Math.PI / 2,
      });
    }

    // LLM at center
    if (pipelineState.llmConfigured) {
      segments.push({
        x: centerX,
        y: centerY,
        type: "llm",
        angle: 0,
      });
    }

    // Outputs arranged in a circle around the center
    pipelineState.outputStages.forEach((stage, i) => {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2; // Start at top, distribute evenly
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      segments.push({
        x,
        y,
        type: "output",
        stage,
        angle,
      });
    });

    // Draw the main circular pipe
    if (pipelineState.llmConfigured) {
      // Draw circle connecting all outputs
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner glow on pipe
      ctx.strokeStyle = "#4a9aff";
      ctx.lineWidth = 6;
      ctx.globalAlpha = 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw pipe from input to center (LLM)
    if (pipelineState.inputStage && pipelineState.llmConfigured) {
      const inputSeg = segments.find((s) => s.type === "input");
      const llmSeg = segments.find((s) => s.type === "llm");

      if (inputSeg && llmSeg) {
        ctx.strokeStyle = "#5a4a3a";
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(inputSeg.x, inputSeg.y);
        ctx.lineTo(llmSeg.x, llmSeg.y);
        ctx.stroke();

        // Inner glow
        ctx.strokeStyle = "#4a9aff";
        ctx.lineWidth = 6;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // Draw spokes from center to each output
    if (pipelineState.llmConfigured) {
      const llmSeg = segments.find((s) => s.type === "llm");
      if (llmSeg) {
        segments
          .filter((s) => s.type === "output")
          .forEach((outSeg) => {
            ctx.strokeStyle = "#5a4a3a";
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.moveTo(llmSeg.x, llmSeg.y);
            ctx.lineTo(outSeg.x, outSeg.y);
            ctx.stroke();

            // Inner glow
            ctx.strokeStyle = "#4a9aff";
            ctx.lineWidth = 6;
            ctx.globalAlpha = 0.4;
            ctx.stroke();
            ctx.globalAlpha = 1;
          });
      }
    }

    // Draw nodes on top of pipes
    segments.forEach((seg) => {
      // Get stage info
      const stageId = seg.stage || seg.type;
      let stage: { icon: string; title: string } | undefined;
      if (seg.type === "input" || seg.type === "output") {
        stage = GAME_STAGES[stageId as GameStageId];
      } else if (seg.type === "llm") {
        stage = { icon: "🧠", title: "LLM Core" };
      }

      // Outer pipe connection ring
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Node circle
      ctx.fillStyle = "#2a2520";
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, 45, 0, Math.PI * 2);
      ctx.fill();

      // Inner border
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Glow effect
      ctx.strokeStyle = "#4a9aff";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Icon
      ctx.font = "35px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#f4e4c1";
      ctx.fillText(stage ? stage.icon : "❓", seg.x, seg.y);

      // Label below or above depending on position
      ctx.font = "bold 13px Georgia";
      ctx.fillStyle = "#d4c5a9";
      const labelY = seg.type === "input" ? seg.y - 70 : seg.y + 70;
      ctx.fillText(stage ? stage.title : "?", seg.x, labelY);
    });

    // Draw "magic source" indicator if we have an input
    if (pipelineState.inputStage) {
      const inputSeg = segments.find((s) => s.type === "input");
      if (inputSeg) {
        ctx.fillStyle = "#4a9aff";
        ctx.globalAlpha = 0.6;
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("✨ Magic Source ✨", inputSeg.x, inputSeg.y - 100);
        ctx.globalAlpha = 1;
      }
    }
  }, [pipelineState, completedStages]);

  return (
    <div className={styles.pipelineCanvas}>
      <canvas ref={canvasRef} width={600} height={600} />
    </div>
  );
}
