import type { InferenceResponse } from "@/types/pipeline";

/**
 * Base interface for all pipeline nodes
 * Each node type implements this interface to provide:
 * - meta: Generates block metadata string to add to system prompt
 * - parse: Parses inference response to extract node-specific output
 */
export interface NodeInterface<TConfig, TOutput> {
  /**
   * Generate block metadata string to append to system prompt
   * @param config - Node configuration
   * @param blockId - Generated block ID (e.g., "color-1")
   * @returns Metadata string to add to system prompt, or empty string if none
   */
  meta: (config: TConfig, blockId: string) => string;

  /**
   * Parse inference response to extract node-specific output
   * @param response - Full inference response including text and tool calls
   * @param blockId - Block ID for this node
   * @returns Parsed output data, or undefined if not found
   */
  parse: (response: InferenceResponse, blockId: string) => TOutput | undefined;
}

