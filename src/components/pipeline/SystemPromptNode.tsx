import { PipelineNode } from "./PipelineNode";
import styles from "./nodes.module.css";

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
