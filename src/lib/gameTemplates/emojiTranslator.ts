import { Languages } from "lucide-react";
import type { GameTemplate, SerializableState } from "./index";
import { generateNodeId } from "./index";

/**
 * Emoji Translator game
 * 
 * Pipeline: TextInput → EmojiDisplay → Inference
 * 
 * How it works:
 * 1. User enters any phrase or sentence
 * 2. The LLM translates it into an emoji story/sequence
 * 3. The emoji translation is displayed
 */
export function createEmojiTranslatorPipeline(): SerializableState {
  const textInputNodeId = generateNodeId();
  const emojiDisplayNodeId = generateNodeId();
  const inferenceNodeId = generateNodeId();

  return {
    systemPromptConfig: {
      prompt: `You are the world's best Emoji Translator! You can convert any text into expressive emoji sequences.

YOUR TASK:
1. Read the phrase or sentence the user wants translated
2. Convert it into a creative emoji sequence
3. Use the display_translation_emoji tool to show your translation

TRANSLATION GUIDELINES:
- Use emojis that represent the words, concepts, or feelings
- Create a sequence that tells the story (can be multiple emojis)
- Be creative with interpretations!
- Include both literal and figurative representations

EXAMPLES:
- "I love pizza" → "❤️🍕"
- "Going to sleep" → "😴💤🛏️"
- "Happy birthday" → "🎂🎉🎁🥳"
- "It's raining cats and dogs" → "🌧️🐱🐕"
- "I'm on top of the world" → "😊🔝🌍"
- "Time flies" → "⏰🦋"

After showing the emoji, explain your translation choices!
Make it fun and see if the user can guess why you chose those emojis!`,
    },
    nodes: [
      {
        id: textInputNodeId,
        type: "text_input",
        config: {
          label: "Enter a phrase to translate",
          placeholder: "Type anything... a phrase, idiom, or sentence!",
        },
      },
      {
        id: emojiDisplayNodeId,
        type: "emoji_display",
        config: {
          name: "translation",
          label: "Emoji Translation",
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
      [inferenceNodeId]: "Translate this to emojis!",
    },
    nodeState: {},
  };
}

/**
 * Emoji Translator game template metadata
 */
export const emojiTranslatorTemplate: GameTemplate = {
  id: "emoji-translator",
  name: "Emoji Translator",
  description: "Convert any phrase into an expressive emoji story!",
  icon: Languages,
  difficulty: "easy",
  tags: ["emoji", "translation", "fun"],
  createPipeline: createEmojiTranslatorPipeline,
};

