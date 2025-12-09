import { PipelineNode } from "./PipelineNode";
import styles from "./nodes.module.css";

interface OutputNodeProps {
  response: string;
  loading: boolean;
  error: string | null;
  blockId?: string;
}

export function OutputNode({ response, loading, error, blockId }: OutputNodeProps) {
  return (
    <PipelineNode
      title="Output"
      description="The model's response appears here"
      isLast
      blockId={blockId}
    >
      <div className={styles.outputContainer}>
        {error ? (
          <div className={styles.error}>{error}</div>
        ) : loading ? (
          <div className={styles.loadingOutput}>
            <span className={styles.spinner} />
            Generating response...
          </div>
        ) : response ? (
          <div className={styles.response}>{response}</div>
        ) : (
          <div className={styles.emptyState}>
            Response will appear here after you run inference
          </div>
        )}
      </div>
    </PipelineNode>
  );
}
