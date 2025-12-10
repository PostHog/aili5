export interface ImageData {
  type: "base64";
  mediaType: "image/png" | "image/jpeg" | "image/gif" | "image/webp";
  data: string; // base64 encoded image data without the data URL prefix
}

export interface InferenceParams {
  systemPrompt: string;
  userMessage: string;
  model: string;
  temperature: number;
  tools?: unknown[];
  toolChoice?: "auto" | "any" | { type: "tool"; name: string };
  images?: ImageData[];
}

export interface InferenceResult {
  response?: string;
  toolCalls?: Array<{ toolName: string; toolId: string; input: Record<string, unknown> }>;
  error?: string;
}

/**
 * Calls the /api/inference endpoint
 */
export async function runInference(params: InferenceParams): Promise<InferenceResult> {
  const response = await fetch("/api/inference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemPrompt: params.systemPrompt,
      userMessage: params.userMessage,
      model: params.model,
      temperature: params.temperature,
      tools: params.tools,
      toolChoice: params.toolChoice,
      images: params.images,
    }),
  });

  return response.json();
}
