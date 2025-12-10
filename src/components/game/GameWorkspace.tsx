"use client";

import { useState, useEffect } from "react";
import { useGameState, GAME_STAGES, type GameStageId } from "@/hooks/useGameState";
import { usePipelineStore } from "@/store/pipelineStore";
import { useURLLoader } from "@/hooks/useURLLoader";
import { TextInputNodeEditor } from "@/components/builder/nodes/TextInputNodeEditor";
import { URLLoaderNodeEditor } from "@/components/builder/nodes/URLLoaderNodeEditor";
import { InferenceNodeEditor } from "@/components/builder/nodes/InferenceNodeEditor";
import { ColorDisplayNodeEditor } from "@/components/builder/nodes/ColorDisplayNodeEditor";
import { IconDisplayNodeEditor } from "@/components/builder/nodes/IconDisplayNodeEditor";
import { PixelArtDisplayNodeEditor } from "@/components/builder/nodes/PixelArtDisplayNodeEditor";
import { GenieNodeEditor } from "@/components/builder/nodes/GenieNodeEditor";
import type {
  TextInputConfig,
  URLLoaderConfig,
  InferenceConfig,
  ColorDisplayConfig,
  IconDisplayConfig,
  PixelArtDisplayConfig,
  GenieConfig,
  GaugeDisplayConfig,
  WebhookTriggerConfig,
  SurveyConfig,
} from "@/types/pipeline";
import styles from "./GameLayout.module.css";

interface GameWorkspaceProps {
  onStageComplete: (stageId: GameStageId) => void;
}

export function GameWorkspace({ onStageComplete }: GameWorkspaceProps) {
  const showWelcome = useGameState((state) => state.showWelcome);
  const currentStage = useGameState((state) => state.currentStage);
  const pipelineState = useGameState((state) => state.pipelineState);
  const completedStages = useGameState((state) => state.completedStages);
  const setShowWelcome = useGameState((state) => state.setShowWelcome);
  const setCurrentStage = useGameState((state) => state.setCurrentStage);

  const pipelineStore = usePipelineStore();
  const urlLoader = useURLLoader();

  const [showHelp, setShowHelp] = useState(false);

  const handleStart = () => {
    setShowWelcome(false);
    setCurrentStage(null);
  };

  const handleStageComplete = (stageId: GameStageId) => {
    onStageComplete(stageId);
  };

  if (showWelcome) {
    return (
      <div className={styles.workspace}>
        <h2>Welcome to The Array ReaLLM! 🔧</h2>
        <div className={styles.tutorialText}>
          <p>
            <strong>Greetings, apprentice!</strong> I'm Bristle Thornweaver, and I'll teach you
            how AI language models work by building magical pipelines!
          </p>
          <p>
            <strong>Here's how it works:</strong>
          </p>
          <p>
            1️⃣ <strong>Choose an INPUT</strong> - Pick how you want to feed information into the
            pipeline (URL, Text, or Genie)
          </p>
          <p>
            2️⃣ <strong>Configure the LLM</strong> - Set up the AI brain that processes everything
          </p>
          <p>
            3️⃣ <strong>Add OUTPUTS</strong> - Choose how you want the AI to display results
            (complete all 6 to finish!)
          </p>
          <p>
            <strong>Each stage you complete earns you a badge and builds the pipeline!</strong>
          </p>
        </div>
        <div className={styles.buttonCenter}>
          <button className={styles.btnPrimary} onClick={handleStart}>
            Start Building! 🚀
          </button>
        </div>
      </div>
    );
  }

  if (!currentStage) {
    // Show input selection if no input, or output selection if LLM is configured
    if (!pipelineState.inputStage) {
      return (
        <div className={styles.workspace}>
          <h2>Step 1: Choose Your Input Source</h2>
          <div className={styles.tutorialText}>
            <p>Every pipeline needs a source of information! Choose one of these input methods:</p>
          </div>
          <div className={styles.outputGrid}>
            <div
              className={styles.outputOption}
              onClick={() => setCurrentStage("urlLoader")}
            >
              <div className={styles.outputIcon}>🌐</div>
              <div className={styles.outputName}>URL Loader</div>
              <div className={styles.outputDesc}>Load web content</div>
            </div>
            <div
              className={styles.outputOption}
              onClick={() => setCurrentStage("text")}
            >
              <div className={styles.outputIcon}>📝</div>
              <div className={styles.outputName}>Text Input</div>
              <div className={styles.outputDesc}>Add your own text</div>
            </div>
            <div
              className={styles.outputOption}
              onClick={() => setCurrentStage("genie")}
            >
              <div className={styles.outputIcon}>🧙</div>
              <div className={styles.outputName}>Genie</div>
              <div className={styles.outputDesc}>Self-reasoning agent</div>
            </div>
          </div>
        </div>
      );
    } else if (pipelineState.llmConfigured && pipelineState.outputStages.length < 6) {
      // Show output selection
      const outputs: GameStageId[] = ["color", "icon", "gauge", "pixelArt", "webhook", "survey"];
      const remaining = outputs.filter((id) => !completedStages.has(id));
      
      return (
        <div className={styles.workspace}>
          <h2>Choose Your Next Output! ({pipelineState.outputStages.length}/6 Complete)</h2>
          <div className={styles.tutorialText}>
            <p>
              Great work! Now choose how you want the AI to display its results. Complete all 6
              output types to finish the pipeline!
            </p>
          </div>
          <div className={styles.outputGrid}>
            {remaining.map((id) => {
              const stage = GAME_STAGES[id];
              return (
                <div
                  key={id}
                  className={styles.outputOption}
                  onClick={() => setCurrentStage(id)}
                >
                  <div className={styles.outputIcon}>{stage.icon}</div>
                  <div className={styles.outputName}>{stage.title}</div>
                  <div className={styles.outputDesc}>{stage.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  }

  const stage = GAME_STAGES[currentStage];
  const isCompleted = completedStages.has(currentStage);

  // Map stage IDs to node types
  const stageToNodeType: Record<GameStageId, string> = {
    urlLoader: "url_loader",
    text: "text_input",
    genie: "genie",
    llm: "inference",
    color: "color_display",
    icon: "icon_display",
    gauge: "gauge_display",
    pixelArt: "pixel_art_display",
    webhook: "webhook_trigger",
    survey: "survey",
  };

  // Find or create node for this stage
  const nodeType = currentStage ? stageToNodeType[currentStage] : null;
  const node = nodeType
    ? pipelineStore.nodes.find((n) => n.type === nodeType)
    : null;

  // Create node if it doesn't exist (in useEffect to avoid render-time state updates)
  useEffect(() => {
    if (!currentStage || !nodeType) return;

    const existingNode = pipelineStore.nodes.find((n) => n.type === nodeType);
    if (existingNode) return;

    const nodeId = `game-${currentStage}`;
    const defaultConfigs: Record<string, any> = {
      url_loader: { url: "https://en.wikipedia.org/wiki/Hedgehog", label: "" },
      text_input: { label: "", placeholder: "" },
      genie: {
        name: "genie",
        backstory: "You are a helpful genie.",
        model: "claude-sonnet-4-20250514",
        temperature: 0.7,
      },
      inference: { model: "claude-sonnet-4-20250514", temperature: 0.7 },
      color_display: { name: "color", label: "Color" },
      icon_display: { name: "icon", label: "Icon" },
      gauge_display: { name: "gauge", label: "Gauge" },
      pixel_art_display: { name: "pixelArt", label: "Pixel Art" },
      webhook_trigger: { name: "webhook", label: "Webhook" },
      survey: { name: "survey", label: "Survey" },
    };

    const newNode = {
      id: nodeId,
      type: nodeType as any,
      config: defaultConfigs[nodeType] || {},
    };
    pipelineStore.addNode(newNode);
  }, [currentStage, nodeType, pipelineStore]);

  const renderStageEditor = () => {
    if (!node || !currentStage) return null;
    
    const nodeId = node.id;
    const userInput = pipelineStore.userInputs[nodeId] || "";

    switch (currentStage) {
      case "urlLoader": {
        const config = node!.config as URLLoaderConfig;
        const urlContext = urlLoader.urlContexts[nodeId] || null;
        return (
          <URLLoaderNodeEditor
            config={config}
            onChange={(newConfig) => pipelineStore.updateConfig(nodeId, newConfig)}
            urlContext={urlContext}
            onLoadURL={(id, url, label) => urlLoader.loadURL(id, url, label)}
            nodeId={nodeId}
            loading={urlLoader.loadingUrlNodeIds.has(nodeId)}
          />
        );
      }
      case "text": {
        const config = node!.config as TextInputConfig;
        return (
          <TextInputNodeEditor
            config={config}
            onChange={(newConfig) => pipelineStore.updateConfig(nodeId, newConfig)}
            value={userInput}
            onValueChange={(value) => pipelineStore.setUserInput(nodeId, value)}
            nodeId={nodeId}
          />
        );
      }
      case "genie": {
        const config = node!.config as GenieConfig;
        // Genie editor is more complex, we'll show a simplified version
        return (
          <div className={styles.nodeEditor}>
            <div className={styles.field}>
              <label className={styles.label}>Genie Name</label>
              <input
                type="text"
                className={styles.input}
                value={config.name || "genie"}
                onChange={(e) =>
                  pipelineStore.updateConfig(nodeId, { ...config, name: e.target.value })
                }
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Backstory</label>
              <textarea
                className={styles.textarea}
                value={config.backstory || ""}
                onChange={(e) =>
                  pipelineStore.updateConfig(nodeId, { ...config, backstory: e.target.value })
                }
                rows={4}
                placeholder="Give your genie a backstory..."
              />
            </div>
          </div>
        );
      }
      case "llm": {
        const config = node!.config as InferenceConfig;
        return (
          <InferenceNodeEditor
            config={config}
            onChange={(newConfig) => pipelineStore.updateConfig(nodeId, newConfig)}
            userInput={userInput}
            onUserInputChange={(value) => pipelineStore.setUserInput(nodeId, value)}
            onRun={() => {
              // This will be handled by the pipeline builder
            }}
            loading={pipelineStore.loadingNodeId === nodeId}
            output={node!.output as any}
          />
        );
      }
      case "color": {
        const config = node!.config as ColorDisplayConfig;
        return (
          <ColorDisplayNodeEditor
            config={config}
            onChange={(newConfig) => pipelineStore.updateConfig(nodeId, newConfig)}
            output={node!.output as any}
            loading={false}
          />
        );
      }
      case "icon": {
        const config = node!.config as IconDisplayConfig;
        return (
          <IconDisplayNodeEditor
            config={config}
            onChange={(newConfig) => pipelineStore.updateConfig(nodeId, newConfig)}
            output={node!.output as any}
            loading={false}
          />
        );
      }
      case "gauge": {
        const config = node!.config as GaugeDisplayConfig;
        return (
          <div className={styles.nodeEditor}>
            <div className={styles.field}>
              <label className={styles.label}>Gauge Name</label>
              <input
                type="text"
                className={styles.input}
                value={config.name || "gauge"}
                onChange={(e) =>
                  pipelineStore.updateConfig(nodeId, { ...config, name: e.target.value })
                }
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Label</label>
              <input
                type="text"
                className={styles.input}
                value={config.label || ""}
                onChange={(e) =>
                  pipelineStore.updateConfig(nodeId, { ...config, label: e.target.value })
                }
              />
            </div>
            <p className={styles.helpText}>
              Configure the gauge output. The AI will be able to display numeric values here.
            </p>
          </div>
        );
      }
      case "pixelArt": {
        const config = node!.config as PixelArtDisplayConfig;
        return (
          <PixelArtDisplayNodeEditor
            config={config}
            onChange={(newConfig) => pipelineStore.updateConfig(nodeId, newConfig)}
            output={node!.output as any}
            loading={false}
          />
        );
      }
      case "webhook": {
        const config = node!.config as WebhookTriggerConfig;
        return (
          <div className={styles.nodeEditor}>
            <div className={styles.field}>
              <label className={styles.label}>Webhook Name</label>
              <input
                type="text"
                className={styles.input}
                value={config.name || "webhook"}
                onChange={(e) =>
                  pipelineStore.updateConfig(nodeId, { ...config, name: e.target.value })
                }
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Label</label>
              <input
                type="text"
                className={styles.input}
                value={config.label || ""}
                onChange={(e) =>
                  pipelineStore.updateConfig(nodeId, { ...config, label: e.target.value })
                }
              />
            </div>
            <p className={styles.helpText}>
              Configure the webhook output. The AI will be able to trigger HTTP requests here.
            </p>
          </div>
        );
      }
      case "survey": {
        const config = node!.config as SurveyConfig;
        return (
          <div className={styles.nodeEditor}>
            <div className={styles.field}>
              <label className={styles.label}>Survey Name</label>
              <input
                type="text"
                className={styles.input}
                value={config.name || "survey"}
                onChange={(e) =>
                  pipelineStore.updateConfig(nodeId, { ...config, name: e.target.value })
                }
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Label</label>
              <input
                type="text"
                className={styles.input}
                value={config.label || ""}
                onChange={(e) =>
                  pipelineStore.updateConfig(nodeId, { ...config, label: e.target.value })
                }
              />
            </div>
            <p className={styles.helpText}>
              Configure the survey output. The AI will be able to create multiple choice questions here.
            </p>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const canComplete = () => {
    if (!node || !currentStage) return false;
    
    if (currentStage === "urlLoader") {
      const urlContext = urlLoader.urlContexts[node.id];
      return urlContext && !urlContext.error;
    }
    if (currentStage === "text") {
      return (pipelineStore.userInputs[node.id] || "").trim().length > 0;
    }
    if (currentStage === "llm") {
      return pipelineState.llmConfigured || node.config.temperature !== undefined;
    }
    // For outputs, just having the node configured is enough
    return true;
  };

  if (!node || !currentStage) {
    return null;
  }

  return (
    <div className={styles.workspace}>
      <h2>
        {stage.icon} {stage.title}
      </h2>
      <button className={styles.helpBtn} onClick={() => setShowHelp(!showHelp)}>
        ❓ Need Help?
      </button>
      {showHelp && (
        <div className={`${styles.helpBox} ${showHelp ? styles.visible : ""}`}>
          <p>
            <strong>What to do:</strong>
          </p>
          <p>{stage.helpText}</p>
        </div>
      )}
      <div className={styles.tutorialText}>
        <p>{stage.tutorial}</p>
      </div>
      {renderStageEditor()}
      {!isCompleted && (
        <div className={styles.buttonCenter}>
          <button
            className={styles.btnPrimary}
            onClick={() => handleStageComplete(currentStage)}
            disabled={!canComplete()}
          >
            ✓ Complete Stage
          </button>
        </div>
      )}
      {isCompleted && (
        <div className={styles.completedMessage}>✓ Stage completed!</div>
      )}
    </div>
  );
}
