import type { InferenceResponse } from "@/types/pipeline";
import type { NodeInterface } from "@/lib/nodeInterface";
import { ColorDisplayNodeInterface } from "@/components/pipeline/ColorDisplayNode";
import { SystemPromptNodeInterface } from "@/components/pipeline/SystemPromptNode";
import { ModelAndInferenceNodeInterface } from "@/components/pipeline/ModelAndInferenceNode";
import { OutputNodeInterface } from "@/components/pipeline/OutputNode";

/**
 * Registry of node interfaces by block type
 * Each node type implements NodeInterface with meta and parse methods
 */
const nodeInterfaces: Record<string, NodeInterface<any, any>> = {
  color_display: ColorDisplayNodeInterface,
  system_prompt: SystemPromptNodeInterface,
  inference: ModelAndInferenceNodeInterface,
  text_display: OutputNodeInterface,
  // Add more node interfaces here as needed
  // icon_display: IconDisplayNodeInterface,
  // gauge_display: GaugeDisplayNodeInterface,
};

/**
 * Generate block metadata for a specific node type
 * Combines metadata from all nodes of the given type
 */
export function generateBlockMetadata<TConfig = unknown>(
  blockType: string,
  config: TConfig,
  blockId: string
): string {
  const nodeInterface = nodeInterfaces[blockType];
  if (!nodeInterface) {
    return "";
  }
  return nodeInterface.meta(config, blockId);
}

/**
 * Parse output for a specific block type
 */
export function parseBlockOutput<T = unknown>(
  blockType: string,
  response: InferenceResponse,
  blockId: string
): T | undefined {
  const nodeInterface = nodeInterfaces[blockType];
  if (!nodeInterface) {
    return undefined;
  }
  return nodeInterface.parse(response, blockId) as T | undefined;
}

/**
 * Get all registered block types
 */
export function getRegisteredBlockTypes(): string[] {
  return Object.keys(nodeInterfaces);
}

