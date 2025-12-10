import type { LucideIcon } from "lucide-react";
import type {
  SystemPromptConfig,
  PipelineNodeConfig,
} from "@/types/pipeline";

// Re-export individual game templates
export { createPictionaryPipeline } from "./pictionary";

/**
 * Serializable state that can be loaded into the pipeline store.
 * This matches the structure expected by usePipelineStore.pastePipeline()
 */
export interface SerializableState {
  systemPromptConfig: SystemPromptConfig;
  nodes: PipelineNodeConfig[];
  userInputs: Record<string, string>;
  nodeState: Record<string, unknown>;
}

/**
 * A game template that can be loaded into the pipeline editor.
 * 
 * Key design principle: Factory functions, not stored data.
 * Each template's createPipeline() generates a fresh pipeline with new IDs.
 * If the data model changes, TypeScript will flag what needs updating.
 * No migrations needed because there's no stored data.
 */
export interface GameTemplate {
  /** Unique identifier for this game */
  id: string;
  /** Display name */
  name: string;
  /** Short description of the game */
  description: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Difficulty level */
  difficulty: "easy" | "medium" | "hard";
  /** Tags for filtering/categorization */
  tags: string[];
  /** Factory function that generates a fresh pipeline state */
  createPipeline: () => SerializableState;
}

// Import game templates
import { pictionaryTemplate } from "./pictionary";

/**
 * Registry of all available game templates.
 * Add new games here as they're created.
 */
export const GAME_TEMPLATES: GameTemplate[] = [
  pictionaryTemplate,
  // Future games:
  // triviaTemplate,
  // moodRingTemplate,
  // storyChainTemplate,
];

/**
 * Get a game template by ID
 */
export function getGameTemplate(id: string): GameTemplate | undefined {
  return GAME_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get all game templates, optionally filtered by tag
 */
export function getGameTemplates(tag?: string): GameTemplate[] {
  if (!tag) return GAME_TEMPLATES;
  return GAME_TEMPLATES.filter((t) => t.tags.includes(tag));
}

/**
 * Generate a unique ID for pipeline nodes
 */
export function generateNodeId(): string {
  return crypto.randomUUID();
}

