"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameStageId =
  | "urlLoader"
  | "text"
  | "genie"
  | "llm"
  | "color"
  | "icon"
  | "gauge"
  | "pixelArt"
  | "webhook"
  | "survey";

export type StageType = "input" | "process" | "output";

export interface GameStage {
  id: GameStageId;
  title: string;
  icon: string;
  badge: string;
  type: StageType;
  description: string;
  tutorial: string;
  helpText: string;
}

export const GAME_STAGES: Record<GameStageId, GameStage> = {
  urlLoader: {
    id: "urlLoader",
    title: "URL Loader",
    icon: "🌐",
    badge: "🔗",
    type: "input",
    description: "Load web content",
    tutorial:
      "The URL Loader brings information from the internet into the pipeline. Just like Bristle needs to know what needs fixing, the AI needs information to work with!",
    helpText:
      'Enter any website URL (like https://en.wikipedia.org/wiki/Hedgehog) and click "Load Content". This will fetch the webpage and add it to the pipeline as context for the AI to use.',
  },
  text: {
    id: "text",
    title: "Text Input",
    icon: "📝",
    badge: "✍️",
    type: "input",
    description: "Add text to context",
    tutorial:
      "Text Input lets you add your own instructions or information directly. This is like giving Bristle specific directions about what you want!",
    helpText:
      'Type any text or question you want the AI to process. Try something like: "Write a short poem about hedgehogs" or "Explain what a rainbow is".',
  },
  genie: {
    id: "genie",
    title: "Genie",
    icon: "🧙",
    badge: "✨",
    type: "input",
    description: "Self-inferencing agent",
    tutorial:
      "Genie is a self-inferencing agent - like Bristle's wise mentor who can think through problems step by step and make decisions on its own!",
    helpText:
      'Give Genie a complex task that requires thinking. Try: "Plan a birthday party for a hedgehog" or "Solve this riddle: What gets wet while drying?"',
  },
  llm: {
    id: "llm",
    title: "LLM Core",
    icon: "🧠",
    badge: "🤖",
    type: "process",
    description: "Run the model",
    tutorial:
      "This is the heart of the pipeline - the Large Language Model! It takes all the input and processes it, just like how Bristle's enchanted wrench transforms raw magic into useful energy.",
    helpText:
      'The LLM reads everything that came before it and generates a response. You can adjust the "temperature" - lower values (0.1-0.5) make it more focused and predictable, higher values (0.7-1.0) make it more creative and varied.',
  },
  color: {
    id: "color",
    title: "Color Output",
    icon: "🎨",
    badge: "🌈",
    type: "output",
    description: "Display a color",
    tutorial:
      "Color Output takes the AI's response and displays it as a color! The AI can generate colors based on moods, objects, or any description.",
    helpText:
      'Ask the AI to describe a color for something (like "What color represents happiness?" or "Give me a calming color"). The output will display the color the AI generates!',
  },
  icon: {
    id: "icon",
    title: "Icon Output",
    icon: "🎭",
    badge: "🖼️",
    type: "output",
    description: "Display an icon",
    tutorial:
      "Icon Output lets the AI choose an emoji or symbol to represent its response visually!",
    helpText:
      'Ask the AI to pick an icon for something (like "What emoji represents summer?" or "Choose an icon for bravery"). The AI will select an appropriate symbol!',
  },
  gauge: {
    id: "gauge",
    title: "Gauge Output",
    icon: "📊",
    badge: "📈",
    type: "output",
    description: "Display a number",
    tutorial:
      "Gauge Output displays numerical information from the AI. Perfect for scores, percentages, or measurements!",
    helpText:
      'Ask the AI for a number (like "Rate the cuteness of hedgehogs from 1-10" or "What percentage of Earth is water?"). The gauge will display the numeric answer!',
  },
  pixelArt: {
    id: "pixelArt",
    title: "Pixel Art Output",
    icon: "🎮",
    badge: "🕹️",
    type: "output",
    description: "Display pixel art",
    tutorial:
      "Pixel Art Output lets the AI create simple pixel art patterns! It generates a grid of colored pixels to make tiny images.",
    helpText:
      'Ask the AI to create simple pixel art (like "Make a small pixel art heart" or "Create a pixel tree"). The AI will generate a pattern!',
  },
  webhook: {
    id: "webhook",
    title: "Webhook Output",
    icon: "🔔",
    badge: "📡",
    type: "output",
    description: "Trigger HTTP request",
    tutorial:
      "Webhook Output sends the AI's response to another system or service on the internet. It's like Bristle sending a message through the pipes to other workshops!",
    helpText:
      'Enter a webhook URL (or use the demo URL) and the AI\'s response will be sent there. This is how AI systems connect to other apps and services!',
  },
  survey: {
    id: "survey",
    title: "Survey Output",
    icon: "📋",
    badge: "☑️",
    type: "output",
    description: "Multiple choice",
    tutorial:
      "Survey Output turns the AI's response into a multiple choice question! Great for quizzes, polls, or decision-making.",
    helpText:
      'Ask the AI to create a quiz question or present options (like "Create a quiz question about hedgehogs" or "Give me 3 dinner options"). It will format it as multiple choice!',
  },
};

interface GameState {
  currentStage: GameStageId | null;
  completedStages: Set<GameStageId>;
  pipelineState: {
    inputStage: GameStageId | null;
    llmConfigured: boolean;
    outputStages: GameStageId[];
  };
  showWelcome: boolean;
}

interface GameActions {
  setCurrentStage: (stage: GameStageId | null) => void;
  completeStage: (stageId: GameStageId) => void;
  setInputStage: (stage: GameStageId | null) => void;
  setLLMConfigured: (configured: boolean) => void;
  addOutputStage: (stage: GameStageId) => void;
  setShowWelcome: (show: boolean) => void;
  isLocked: (stageId: GameStageId) => boolean;
  reset: () => void;
}

type GameStore = GameState & GameActions;

const initialState: GameState = {
  currentStage: null,
  completedStages: new Set<GameStageId>(),
  pipelineState: {
    inputStage: null,
    llmConfigured: false,
    outputStages: [],
  },
  showWelcome: true,
};

export const useGameState = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setCurrentStage: (stage) => {
      set({ currentStage: stage });
    },

    completeStage: (stageId) => {
      const stage = GAME_STAGES[stageId];
      set((state) => {
        const newCompleted = new Set(state.completedStages);
        newCompleted.add(stageId);

        const newPipelineState = { ...state.pipelineState };

        if (stage.type === "input") {
          newPipelineState.inputStage = stageId;
        } else if (stageId === "llm") {
          newPipelineState.llmConfigured = true;
        } else if (stage.type === "output") {
          if (!newPipelineState.outputStages.includes(stageId)) {
            newPipelineState.outputStages.push(stageId);
          }
        }

        return {
          completedStages: newCompleted,
          pipelineState: newPipelineState,
        };
      });
    },

    setInputStage: (stage) => {
      set((state) => ({
        pipelineState: { ...state.pipelineState, inputStage: stage },
      }));
    },

    setLLMConfigured: (configured) => {
      set((state) => ({
        pipelineState: { ...state.pipelineState, llmConfigured: configured },
      }));
    },

    addOutputStage: (stage) => {
      set((state) => {
        const outputStages = [...state.pipelineState.outputStages];
        if (!outputStages.includes(stage)) {
          outputStages.push(stage);
        }
        return {
          pipelineState: { ...state.pipelineState, outputStages },
        };
      });
    },

    setShowWelcome: (show) => {
      set({ showWelcome: show });
    },

    isLocked: (stageId) => {
      const state = get();
      const stage = GAME_STAGES[stageId];

      // Input stages are never locked (can switch between them)
      if (stage.type === "input") {
        return false;
      }

      // LLM is locked until an input is selected
      if (stageId === "llm") {
        return !state.pipelineState.inputStage;
      }

      // Outputs are locked until LLM is configured
      if (stage.type === "output") {
        return !state.pipelineState.llmConfigured;
      }

      return false;
    },

    reset: () => {
      set(initialState);
    },
  }))
);
