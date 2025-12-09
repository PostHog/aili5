# Node Interface Specification

This document defines the standard interface that all pipeline nodes must implement.

## Overview

All pipeline nodes follow a consistent pattern through the `NodeInterface` interface. This provides:
- **Consistent metadata generation** for system prompts
- **Standardized response parsing** for extracting node-specific data
- **Easy extensibility** for adding new node types

## NodeInterface

```typescript
interface NodeInterface<TConfig, TOutput> {
  meta: (config: TConfig, blockId: string) => string;
  parse: (response: InferenceResponse, blockId: string) => TOutput | undefined;
}
```

### Methods

#### `meta(config: TConfig, blockId: string): string`

Generates block metadata string to append to the system prompt. This allows the LLM to understand what blocks are available and how to reference them.

**Parameters:**
- `config`: The node's configuration object
- `blockId`: The generated block ID (e.g., "color-1", "gauge-2")

**Returns:**
- A string to append to the system prompt, or empty string if no metadata is needed

**Example:**
```typescript
meta: (config: ColorDisplayConfig, blockId: string) => {
  const label = config.label || "Mood Color";
  return `\n\nAvailable blocks:
- "${label}": ${blockId}, block-type: color

If the user references a block by name (label) that is a color block, return as part of the response a key-value map of colors where block id: hex value.
For example: { "${blockId}": "#ff5500" }`;
}
```

#### `parse(response: InferenceResponse, blockId: string): TOutput | undefined`

Parses the inference response to extract node-specific output data.

**Parameters:**
- `response`: The full inference response including text and tool calls
- `blockId`: The block ID for this node

**Returns:**
- Parsed output data specific to this node type, or `undefined` if not found

**Example:**
```typescript
parse: (response: InferenceResponse, blockId: string) => {
  // First, try to parse from tool calls
  if (response.toolCalls) {
    const colorToolCall = response.toolCalls.find((tc) => tc.name === "display_color");
    if (colorToolCall && colorToolCall.input) {
      const input = colorToolCall.input as Record<string, unknown>;
      return {
        hex: input.hex as string,
        name: input.name as string | undefined,
        explanation: input.explanation as string | undefined,
      };
    }
  }

  // Fallback: try to parse from response text
  if (response.response) {
    return parseColorFromResponse(response.response, blockId);
  }

  return undefined;
}
```

## Node Types

### Color Display Node

**Interface:** `ColorDisplayNodeInterface`

**Config Type:** `ColorDisplayConfig`
```typescript
{
  label?: string;
  description?: string;
  showHex?: boolean;
}
```

**Output Type:** `ColorOutput`
```typescript
{
  hex: string;
  name?: string;
  explanation?: string;
}
```

**Behavior:**
- `meta`: Generates block metadata instructing the LLM to return color mappings when referencing the block
- `parse`: Extracts color from tool calls (`display_color`) or parses hex colors from response text

### System Prompt Node

**Interface:** `SystemPromptNodeInterface`

**Config Type:** `SystemPromptConfig`
```typescript
{
  prompt: string;
}
```

**Output Type:** `never` (no output)

**Behavior:**
- `meta`: Returns empty string (system prompts don't add metadata)
- `parse`: Returns `undefined` (system prompts don't parse output)

### Model and Inference Node

**Interface:** `ModelAndInferenceNodeInterface`

**Config Type:** `InferenceConfig`
```typescript
{
  model: string;
  temperature: number;
  maxTokens?: number;
  // ...
}
```

**Output Type:** `never` (no output)

**Behavior:**
- `meta`: Returns empty string (inference nodes don't add metadata)
- `parse`: Returns `undefined` (inference nodes trigger inference, don't parse output)

### Text Display Node

**Interface:** `OutputNodeInterface`

**Config Type:** `TextDisplayConfig`
```typescript
{
  label?: string;
}
```

**Output Type:** `{ content: string }`

**Behavior:**
- `meta`: Returns empty string (text display nodes don't add metadata)
- `parse`: Extracts text content from `response.response`

## Usage Pattern

### Registering a Node Interface

In `src/lib/blockParsers.ts`:

```typescript
const nodeInterfaces: Record<string, NodeInterface<unknown, unknown>> = {
  color_display: ColorDisplayNodeInterface,
  system_prompt: SystemPromptNodeInterface,
  // ... other nodes
};
```

### Generating Metadata

```typescript
import { generateBlockMetadata } from "@/lib/blockParsers";

const metadata = generateBlockMetadata("color_display", colorConfig, "color-1");
// Appends to system prompt
```

### Parsing Output

```typescript
import { parseBlockOutput } from "@/lib/blockParsers";

const colorOutput = parseBlockOutput<ColorOutput>("color_display", response, "color-1");
// Returns parsed color data or undefined
```

## Adding a New Node Type

1. **Create the node interface** in the node component file:
   ```typescript
   export const MyNewNodeInterface: NodeInterface<MyConfig, MyOutput> = {
     meta: (config, blockId) => {
       // Generate metadata string
       return "...";
     },
     parse: (response, blockId) => {
       // Parse response and return output
       return { ... };
     },
   };
   ```

2. **Register it** in `src/lib/blockParsers.ts`:
   ```typescript
   import { MyNewNodeInterface } from "@/components/pipeline/MyNewNode";
   
   const nodeInterfaces = {
     // ... existing nodes
     my_new_node: MyNewNodeInterface,
   };
   ```

3. **Use it** in your page/component:
   ```typescript
   const metadata = generateBlockMetadata("my_new_node", config, "my-new-node-1");
   const output = parseBlockOutput<MyOutput>("my_new_node", response, "my-new-node-1");
   ```

## Benefits

- **Consistency**: All nodes follow the same pattern
- **Separation of Concerns**: UI components are separate from parsing logic
- **Type Safety**: TypeScript ensures config and output types match
- **Extensibility**: Easy to add new node types without modifying core systems
- **Testability**: Interface methods can be tested independently of React components

