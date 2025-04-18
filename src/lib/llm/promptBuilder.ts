// src/lib/llm/promptBuilder.ts

// Ensure types are imported correctly
import { NarrativeState, Character, Theme } from '../types';
// Ensure data loading functions are imported
import { getCharactersByIds, getThemesByIds } from '../data/loadData';

// --- SYSTEM_PROMPT_BASE (Keep as defined before) ---
const SYSTEM_PROMPT_BASE = `You are a Narrative Director for a pedagogical literary adventure based on George Orwell's "Animal Farm". The player is a new, unnamed animal arriving just before the rebellion. Your goal is to guide them through the story's key events and themes, prompting reflection and understanding using text input primarily, after the initial setup phase.

RULES:
- Adhere strictly to the novel's plot progression, characters, settings, and tone (clear, descriptive, slightly detached, hinting at underlying meanings).
- The player character is observational and learning.
- Generate narrative describing what happens next based on the current situation and the player's last input.
- After the narrative, decide the next interaction: usually 'text_input'. Only use 'button_choice' rarely for critical path decisions if necessary.
- If 'text_input', formulate a specific, open-ended question related to the narrative, a character's actions/feelings, or a theme. The question should encourage reflection or assessment of understanding.
- If 'button_choice', provide 2-3 concise, relevant options.
- Determine the updated narrative state (location, characters, plot points, themes) based on the turn's events.
- Respond ONLY with a valid JSON object adhering to the specified format. Do NOT include any text outside the JSON structure.`;

// --- JSON_OUTPUT_FORMAT_INSTRUCTIONS (Keep as defined before) ---
const JSON_OUTPUT_FORMAT_INSTRUCTIONS = `OUTPUT FORMAT (Valid JSON Object):
{
  "narrative": "string (The generated story text for this turn)",
  "interactionType": "text_input" | "button_choice",
  "choices": [
    { "choice_id": "string (e.g., 'choice1')", "text": "string (Button text)" }
  ],
  "question": "string (The question text, include ONLY if interactionType is 'text_input')",
  "newState": {
    "novelSlug": "string (e.g., 'animal-farm')",
    "currentLocationDesc": "string (Updated location description)",
    "charactersPresent": ["string" (List of character IDs)],
    "plotPointsAchieved": ["string" (Updated list of plot point IDs)],
    "recentThemes": ["string" (Updated list of theme IDs)],
    "turnCount": number (Incremented turn count)
  }
}`;

/**
 * Builds the prompt for the initial phase (using predefined nodes/hints).
 * This function remains unchanged.
 */
export function buildInitialPrompt(nodeHint: string, outcomeHint?: string): string {
    const initialSystemPrompt = `You are generating narrative for a Choose Your Own Adventure based on Animal Farm. The player is a new animal. Describe the scene based on the hints provided. Keep the tone Orwellian. Respond only with the narrative text.`;
    return `${initialSystemPrompt}\n\n${outcomeHint ? `The previous choice resulted in: "${outcomeHint}".\n\n` : ''}Now, describe the following scene: ${nodeHint}`;
}


/**
 * Builds the complex prompt for the main LLM-driven phase.
 * UNCOMMENTED and integrated Theme logic.
 */
export function buildNarrativeDirectorPrompt(
    currentState: NarrativeState,
    userInput: { choiceId?: string | null; responseText?: string | null; }
): string {

    // --- Prepare Contextual Info ---
    // Fetch character data using the imported function and Character type
    const characters: Character[] = getCharactersByIds(currentState.novelSlug, currentState.charactersPresent);
    // Fetch theme data using the imported function and Theme type
    const themes: Theme[] = getThemesByIds(currentState.novelSlug, currentState.recentThemes); // UNCOMMENTED

    let characterInfo = "None relevant right now.";
    if (characters.length > 0) {
        // Accessing properties like c.name uses the Character type implicitly
        characterInfo = characters.map(c => `${c.name} (${c.role || c.species || 'N/A'}): ${c.key_traits?.join(', ') || 'No traits listed'}`).join('\n');
    }

    let themeInfo = "None prominent right now."; // UNCOMMENTED
    if (themes.length > 0) { // UNCOMMENTED
        // Accessing properties like t.name uses the Theme type implicitly
        themeInfo = themes.map(t => `${t.name}: ${t.description}`).join('\n'); // UNCOMMENTED
    }


    // --- Format User Input ---
    let lastActionDescription = "This is the first turn after the initial setup.";
    if (userInput.choiceId) {
        lastActionDescription = `Player selected a choice (ID: ${userInput.choiceId}).`; // Consider enhancing state to include choice text later
    } else if (userInput.responseText) {
        lastActionDescription = `Player provided text input: "${userInput.responseText}"`;
    }

    // --- Assemble Prompt ---
    const prompt = `${SYSTEM_PROMPT_BASE}

${JSON_OUTPUT_FORMAT_INSTRUCTIONS}

CURRENT SITUATION (Turn ${currentState.turnCount}):
Novel: ${currentState.novelSlug}
Location: ${currentState.currentLocationDesc}
Characters Present: ${currentState.charactersPresent.join(', ') || 'None'}
Plot Points Achieved: ${currentState.plotPointsAchieved.join(', ') || 'None'}
Recent Themes: ${currentState.recentThemes.join(', ') || 'None'}

LAST PLAYER ACTION:
${lastActionDescription}

AVAILABLE REFERENCE INFO:
Characters:
${characterInfo}
Themes:
${themeInfo} // Use the generated themeInfo string

YOUR TASK:
1. Write a short narrative paragraph that starts by acknowledging the player's input ("${lastActionDescription}"). For example, if they felt the animals were unhappy, you could start with "Reflecting on the animals' unhappiness, you notice...".
2. Continue the narrative by describing the next scene based on the CURRENT SITUATION and the reference info provided.
3. Decide the next interaction type ('text_input' or 'button_choice'). Prioritize 'text_input'.
4. If 'text_input', create a relevant, open-ended question. If 'button_choice', create 2-3 relevant choices.
5. Determine the updated narrative state (location, characters, plot points, themes, incremented turnCount).
6. Output ONLY the valid JSON object matching the specified format.`;

    return prompt;
}