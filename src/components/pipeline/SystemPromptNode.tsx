import { PipelineNode } from "./PipelineNode";
import type { NodeInterface } from "@/lib/nodeInterface";
import type { SystemPromptConfig, InferenceResponse } from "@/types/pipeline";
import styles from "./nodes.module.css";

/**
 * System Prompt Node Interface
 * System prompt nodes don't generate metadata or parse output
 */
export const SystemPromptNodeInterface: NodeInterface<SystemPromptConfig, never> = {
  meta: () => "", // System prompt nodes don't add metadata
  parse: () => undefined, // System prompt nodes don't parse output
};

interface SystemPromptNodeProps {
  value: string;
  onChange: (value: string) => void;
  blockId?: string;
}

export function SystemPromptNode({ value, onChange, blockId }: SystemPromptNodeProps) {
  return (
    <PipelineNode
      title="System Prompt"
      description="Instructions that define how the model behaves"
      blockId={blockId}
    >
      <textarea
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="You are a helpful assistant..."
        rows={4}
      />
    </PipelineNode>
  );
}
