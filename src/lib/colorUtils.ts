import type { ColorOutput } from "@/types/pipeline";

/**
 * Parse color from response text
 * Tries to find JSON object with color mappings like { "color-1": "#ff5500" }
 * Falls back to finding hex color patterns in text
 */
export function parseColorFromResponse(responseText: string, blockId: string = "color-1"): ColorOutput | undefined {
  // Try to find JSON object with color mappings like { "color-1": "#ff5500" }
  const jsonMatch = responseText.match(new RegExp(`\\{[^}]*"${blockId}"[^}]*\\}`));
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const hexValue = parsed[blockId];
      if (hexValue && /^#[0-9a-fA-F]{6}$/i.test(hexValue)) {
        return { hex: hexValue };
      }
    } catch (e) {
      // Not valid JSON, continue
    }
  }
  
  // Try to find hex color pattern in text
  const hexMatch = responseText.match(/#[0-9a-fA-F]{6}/i);
  if (hexMatch) {
    return { hex: hexMatch[0] };
  }

  return undefined;
}

