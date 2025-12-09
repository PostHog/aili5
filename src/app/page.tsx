"use client";

import { useState } from "react";
import {
  SystemPromptNode,
  ModelAndInferenceNode,
  OutputNode,
  ColorDisplayNode,
} from "@/components/pipeline";
import { generateBlockMetadata, parseBlockOutput } from "@/lib/blockParsers";
import type { ModelId, InferenceRequest, InferenceResponse, ColorDisplayConfig, ColorOutput } from "@/types/pipeline";
import styles from "./page.module.css";

export default function Home() {
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful assistant.");
  const [model, setModel] = useState<ModelId>("claude-sonnet-4-20250514");
  const [temperature, setTemperature] = useState(0.7);
  const [userMessage, setUserMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [colorConfig, setColorConfig] = useState<ColorDisplayConfig>({
    label: "Mood Color",
    description: "A color that represents the mood or emotion",
    showHex: true,
  });
  const [colorOutput, setColorOutput] = useState<ColorOutput | undefined>(undefined);

  const handleRunInference = async () => {
    setLoading(true);
    setError(null);
    setResponse("");
    setColorOutput(undefined);

    try {
      // Add block metadata to system prompt from all nodes
      const blockMetadata = generateBlockMetadata("color_display", colorConfig, "color-1");

      const requestBody: InferenceRequest = {
        systemPrompt: systemPrompt + blockMetadata,
        userMessage,
        model,
        temperature,
      };

      const res = await fetch("/api/inference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data: InferenceResponse = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResponse(data.response);
        
        // Parse outputs for all blocks
        // Loop through blocks and use their parsers
        const parsedColor = parseBlockOutput<ColorOutput>("color_display", data, "color-1");
        setColorOutput(parsedColor);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run inference");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>aili5</h1>
        <p className={styles.subtitle}>Learn how LLMs work by building a pipeline</p>
      </header>

      <main className={styles.pipeline}>
        <SystemPromptNode value={systemPrompt} onChange={setSystemPrompt} blockId="system-prompt-1" />

        <ColorDisplayNode
          config={colorConfig}
          output={colorOutput}
          blockId="color-1"
          loading={loading}
          onConfigChange={setColorConfig}
        />

        <ModelAndInferenceNode
          model={model}
          temperature={temperature}
          userMessage={userMessage}
          loading={loading}
          onModelChange={setModel}
          onTemperatureChange={setTemperature}
          onUserMessageChange={setUserMessage}
          onRun={handleRunInference}
          blockId="inference-1"
        />

        <OutputNode response={response} loading={loading} error={error} blockId="text-display-1" />
      </main>
    </div>
  );
}
