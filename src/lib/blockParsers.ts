import type { InferenceResponse } from "@/types/pipeline";
import { parseColorOutput } from "@/components/pipeline/ColorDisplayNode";
import type { ColorOutput } from "@/types/pipeline";

/**
 * Block parser interface
 * Each block type can provide a parser function
 */
export interface BlockParser<T = unknown> {
  parse: (response: InferenceResponse, blockId: string) => T | undefined;
}

/**
 * Registry of block parsers by block type
 */
const blockParsers: Record<string, BlockParser> = {
  color_display: {
    parse: (response, blockId) => parseColorOutput(response, blockId) as ColorOutput | undefined,
  },
  // Add more block parsers here as needed
  // icon_display: { parse: parseIconOutput },
  // gauge_display: { parse: parseGaugeOutput },
};

/**
 * Parse output for a specific block type
 */
export function parseBlockOutput<T = unknown>(
  blockType: string,
  response: InferenceResponse,
  blockId: string
): T | undefined {
  const parser = blockParsers[blockType];
  if (!parser) {
    return undefined;
  }
  return parser.parse(response, blockId) as T | undefined;
}

/**
 * Get all registered block types
 */
export function getRegisteredBlockTypes(): string[] {
  return Object.keys(blockParsers);
}

