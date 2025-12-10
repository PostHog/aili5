import { BookOpen } from "lucide-react";
import type { GameTemplate, SerializableState } from "./index";
import { generateNodeId } from "./index";

/**
 * Story Builder game
 * 
 * Pipeline: TextInput → EmojiDisplay → Inference
 * 
 * How it works:
 * 1. User writes a sentence or paragraph to start/continue the story
 * 2. The LLM continues the story creatively
 * 3. An emoji reaction shows the mood/tone of the story segment
 */
export function createStoryBuilderPipeline(): SerializableState {
  const textInputNodeId = generateNodeId();
  const emojiDisplayNodeId = generateNodeId();
  const inferenceNodeId = generateNodeId();

  return {
    systemPromptConfig: {
      prompt: `You are a collaborative storyteller! You and the user are writing a story together.

YOUR TASK:
1. Read what the user has written for the story
2. Continue the story with 2-3 engaging sentences
3. Use the display_reaction_emoji tool to show an emoji that captures the mood of your story segment

STORYTELLING GUIDELINES:
- Match the tone and style the user has established
- Add interesting twists, characters, or details
- Leave room for the user to continue
- Keep the narrative flowing naturally
- Be creative but stay coherent with the plot

EMOJI MOOD GUIDE:
- 😊 Happy, lighthearted moments
- 😢 Sad or emotional scenes
- 😱 Scary or suspenseful parts
- 😂 Funny moments
- 🤔 Mysterious or puzzling situations
- ❤️ Romantic or heartwarming scenes
- ⚔️ Action or conflict
- 🌟 Magical or wonder-filled moments
- 😈 Villainous or dark turns

Keep the story going and make it fun!`,
    },
    nodes: [
      {
        id: textInputNodeId,
        type: "text_input",
        config: {
          label: "Write your part of the story",
          placeholder: "Once upon a time... (or continue from where we left off)",
        },
      },
      {
        id: emojiDisplayNodeId,
        type: "emoji_display",
        config: {
          name: "reaction",
          label: "Story Mood",
        },
      },
      {
        id: inferenceNodeId,
        type: "inference",
        config: {
          model: "claude-sonnet-4-20250514",
          temperature: 0.9,
        },
      },
    ],
    userInputs: {
      [inferenceNodeId]: "Continue the story!",
    },
    nodeState: {},
  };
}

/**
 * Story Builder game template metadata
 */
export const storyBuilderTemplate: GameTemplate = {
  id: "story-builder",
  name: "Story Builder",
  description: "Write a story together with AI, one paragraph at a time!",
  icon: BookOpen,
  difficulty: "easy",
  tags: ["creative", "story", "writing"],
  createPipeline: createStoryBuilderPipeline,
};

