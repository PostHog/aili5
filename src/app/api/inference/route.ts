import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { InferenceRequest, InferenceResponse } from "@/types/pipeline";

export async function POST(request: NextRequest): Promise<NextResponse<InferenceResponse>> {
  try {
    const body: InferenceRequest = await request.json();
    const { systemPrompt, userMessage, model, temperature } = body;

    if (!userMessage?.trim()) {
      return NextResponse.json(
        { response: "", error: "User message is required" },
        { status: 400 }
      );
    }

    const posthogApiKey = process.env.POSTHOG_API_KEY;
    const posthogProjectId = process.env.POSTHOG_PROJECT_ID;
    const posthogApiUrl = process.env.POSTHOG_API_URL || "https://us.posthog.com";

    if (!posthogApiKey || !posthogProjectId) {
      return NextResponse.json(
        { response: "", error: "PostHog API credentials not configured" },
        { status: 500 }
      );
    }

    // Use PostHog LLM gateway as the base URL
    const gatewayUrl = `${posthogApiUrl}/api/projects/${posthogProjectId}/llm_gateway`;

    const client = new Anthropic({
      baseURL: gatewayUrl,
      apiKey: posthogApiKey, // Not used but required by SDK
      defaultHeaders: {
        Authorization: `Bearer ${posthogApiKey}`,
      },
    });

    const message = await client.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      temperature,
      tools: [
        {
          name: "display_color",
          description: "Display a color to the user. Use this when asked to show, pick, or represent something as a color.",
          input_schema: {
            type: "object",
            properties: {
              hex: {
                type: "string",
                pattern: "^#[0-9a-fA-F]{6}$",
                description: "Hex color code, e.g. #ff5500",
              },
              name: {
                type: "string",
                description: "Human-readable color name",
              },
              explanation: {
                type: "string",
                description: "Why you chose this color",
              },
            },
            required: ["hex"],
          },
        },
      ],
    });

    // Extract text response and tool calls
    let responseText = "";
    const toolCalls: Array<{ name: string; input: unknown }> = [];
    
    for (const block of message.content) {
      if (block.type === "text") {
        responseText += block.text;
      } else if (block.type === "tool_use") {
        toolCalls.push({
          name: block.name,
          input: block.input,
        });
      }
    }

    return NextResponse.json({ 
      response: responseText,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    });
  } catch (error) {
    console.error("Inference error:", error);
    return NextResponse.json(
      {
        response: "",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
