"use client";

import { useState, useEffect, useMemo } from "react";
import type { SurveyConfig, SurveyOutput, GenieOutput } from "@/types/pipeline";
import type { NodeInterface, InferenceResponse, NodeRuntimeState } from "@/lib/nodeInterface";
import styles from "./NodeEditor.module.css";

/**
 * Parse survey options from text (e.g., from a Genie's response)
 * Expected format:
 * QUESTION: [question text]
 * A) [option A]
 * B) [option B]
 * C) [option C]
 * D) [option D]
 * CORRECT: [letter]
 */
export interface ParsedSurveyData {
  question: string;
  options: Array<{ id: string; label: string }>;
  correctAnswer?: string;
}

export function parseSurveyOptionsFromText(text: string): ParsedSurveyData | null {
  if (!text) return null;

  // Extract question - match from QUESTION: to the first A)
  const questionMatch = text.match(/QUESTION:\s*([^\n]+(?:\n(?![A-D]\))[^\n]*)*)/i);
  if (!questionMatch) return null;

  const question = questionMatch[1].trim();

  // Extract options (A, B, C, D format) - each option ends at the next option letter or CORRECT:
  const options: Array<{ id: string; label: string }> = [];
  const optionPattern = /([A-D])\)\s*([^\n]+)/gi;
  let match;
  while ((match = optionPattern.exec(text)) !== null) {
    options.push({
      id: match[1].toUpperCase(),
      label: match[2].trim(),
    });
  }

  if (options.length === 0) return null;

  // Extract correct answer if present
  const correctMatch = text.match(/CORRECT:\s*([A-D])/i);
  const correctAnswer = correctMatch ? correctMatch[1].toUpperCase() : undefined;

  return { question, options, correctAnswer };
}

/**
 * Get the last assistant message from a genie conversation
 */
function getLastGenieMessage(genieOutput: GenieOutput | null | undefined): string | null {
  if (!genieOutput?.messages?.length) return null;
  
  // Find the last assistant message
  for (let i = genieOutput.messages.length - 1; i >= 0; i--) {
    if (genieOutput.messages[i].role === "assistant") {
      return genieOutput.messages[i].content;
    }
  }
  return null;
}

/**
 * Survey Node Interface
 * Implements NodeInterface for survey blocks
 */
export const SurveyNodeInterface: NodeInterface<SurveyConfig, SurveyOutput> = {
  /**
   * Generate block metadata string for system prompt
   */
  meta: (config: SurveyConfig, blockId: string): string => {
    const toolName = config.name ? `ask_${config.name}_survey` : "ask_survey";
    const label = config.label || config.name || "Survey";

    return `\n\nAvailable output block:
- "${label}": ${blockId}, tool: ${toolName}

To present a multiple choice question, you MUST call the ${toolName} tool with:
- question: The question to ask
- options: Array of {id, label} choices (2-6 options)
- allowMultiple: (optional) Whether multiple selections are allowed
- explanation: (optional) Context for why you're asking`;
  },

  /**
   * Parse survey output from inference response
   * Matches tools like "ask_survey", "ask_answer_survey", etc.
   */
  parse: (response: InferenceResponse, _blockId: string): SurveyOutput | undefined => {
    if (response.toolCalls && response.toolCalls.length > 0) {
      const surveyToolCall = response.toolCalls.find((tc) => {
        const name = tc.toolName;
        return name === "ask_survey" || 
               (name.startsWith("ask_") && name.endsWith("_survey"));
      });
      
      if (surveyToolCall && surveyToolCall.input) {
        const input = surveyToolCall.input;
        return {
          question: input.question as string,
          options: input.options as Array<{ id: string; label: string }>,
          allowMultiple: input.allowMultiple as boolean | undefined,
          explanation: input.explanation as string | undefined,
        };
      }
    }
    return undefined;
  },

  /**
   * Generate context from survey selection for downstream nodes
   */
  context: (config: SurveyConfig, _blockId: string, state: NodeRuntimeState): string | null => {
    const output = state.output as SurveyOutput | undefined;
    if (!output?.selectedIds?.length) return null;

    const label = config.label || config.name || "Survey";
    
    // Build context showing what the user selected
    const selectedOptions = output.options
      .filter(opt => output.selectedIds?.includes(opt.id))
      .map(opt => `${opt.id}) ${opt.label}`)
      .join(", ");

    return `\n\n### ${label} Response
Question: ${output.question}
User selected: ${selectedOptions}`;
  },
};

interface SurveyNodeEditorProps {
  config: SurveyConfig;
  onChange: (config: SurveyConfig) => void;
  output: SurveyOutput | null;
  loading?: boolean;
  /** Output from the preceding node (e.g., GenieOutput) for populateFromPreceding */
  precedingOutput?: GenieOutput | null;
  /** Callback when user selects an option */
  onSelectOption?: (selectedIds: string[]) => void;
}

export function SurveyNodeEditor({
  config,
  onChange,
  output,
  loading = false,
  precedingOutput,
  onSelectOption,
}: SurveyNodeEditorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(output?.selectedIds || []);

  // Parse options from preceding output if configured
  const parsedFromPreceding = useMemo(() => {
    if (!config.populateFromPreceding || !precedingOutput) return null;
    const lastMessage = getLastGenieMessage(precedingOutput);
    if (!lastMessage) return null;
    return parseSurveyOptionsFromText(lastMessage);
  }, [config.populateFromPreceding, precedingOutput]);

  // Determine the active survey data (from output, parsed, or empty)
  const surveyData = useMemo(() => {
    if (output?.question && output?.options?.length) {
      return output;
    }
    if (parsedFromPreceding) {
      return {
        question: parsedFromPreceding.question,
        options: parsedFromPreceding.options,
        correctAnswer: parsedFromPreceding.correctAnswer,
      };
    }
    return null;
  }, [output, parsedFromPreceding]);

  // Sync selectedIds when output changes
  useEffect(() => {
    if (output?.selectedIds) {
      setSelectedIds(output.selectedIds);
    }
  }, [output?.selectedIds]);

  const handleSelectOption = (optionId: string) => {
    let newSelectedIds: string[];
    
    if (output?.allowMultiple) {
      // Toggle selection for multi-select
      if (selectedIds.includes(optionId)) {
        newSelectedIds = selectedIds.filter(id => id !== optionId);
      } else {
        newSelectedIds = [...selectedIds, optionId];
      }
    } else {
      // Single select - replace selection
      newSelectedIds = [optionId];
    }
    
    setSelectedIds(newSelectedIds);
    onSelectOption?.(newSelectedIds);
  };

  return (
    <div className={styles.outputContainer}>
      {/* Config section */}
      <div className={styles.configSection}>
        <label className={styles.label}>
          Name (optional)
          <input
            type="text"
            className={styles.input}
            placeholder="e.g., answer"
            value={config.name || ""}
            onChange={(e) => onChange({ ...config, name: e.target.value || undefined })}
          />
        </label>
        
        <label className={styles.label}>
          Style
          <select
            className={styles.select}
            value={config.style || "buttons"}
            onChange={(e) => onChange({ ...config, style: e.target.value as SurveyConfig["style"] })}
          >
            <option value="buttons">Buttons</option>
            <option value="radio">Radio</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </label>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={config.populateFromPreceding || false}
            onChange={(e) => onChange({ ...config, populateFromPreceding: e.target.checked })}
          />
          <span>Populate from preceding node</span>
        </label>
      </div>

      {/* Survey display */}
      <div className={styles.outputDisplay}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Loading survey...</span>
          </div>
        ) : surveyData ? (
          <div className={styles.surveyContainer}>
            <div className={styles.surveyQuestion}>
              {surveyData.question}
            </div>
            
            {config.style === "dropdown" ? (
              <select
                className={styles.surveyDropdown}
                value={selectedIds[0] || ""}
                onChange={(e) => handleSelectOption(e.target.value)}
              >
                <option value="">Select an option...</option>
                {surveyData.options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.id}) {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className={styles.surveyOptions}>
                {surveyData.options.map((opt) => {
                  const isSelected = selectedIds.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      className={`${styles.surveyOption} ${isSelected ? styles.surveyOptionSelected : ""}`}
                      onClick={() => handleSelectOption(opt.id)}
                      type="button"
                    >
                      {config.style === "radio" && (
                        <span className={styles.radioIndicator}>
                          {isSelected ? "●" : "○"}
                        </span>
                      )}
                      <span className={styles.optionId}>{opt.id})</span>
                      <span className={styles.optionLabel}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedIds.length > 0 && (
              <div className={styles.surveySelection}>
                Selected: {selectedIds.join(", ")}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span>
              {config.populateFromPreceding 
                ? "Waiting for preceding node to provide options..."
                : "The model will provide survey options"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
