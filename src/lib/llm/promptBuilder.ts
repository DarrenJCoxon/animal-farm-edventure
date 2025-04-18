// src/lib/llm/promptBuilder.ts

import { NarrativeState, Character, Theme } from '../types';
import { getCharactersByIds, getThemesByIds } from '../data/loadData';

// --- SYSTEM_PROMPT_BASE (Updated Rules for Dialogue & Interaction Choice) ---
const SYSTEM_PROMPT_BASE = `You are a Narrative Director for a pedagogical literary adventure based on George Orwell's "Animal Farm". The player is a new, unnamed animal arriving just before the rebellion. Your goal is to guide them through the story's key events and themes, balancing narrative progression with moments for reflection and assessment.

**STYLE GUIDE (VERY IMPORTANT):**
- **Perspective & Tense:** Write ALL text (narrative, dialogue, questions, choices) from the player's perspective using the **second-person present tense** (e.g., "You see...", "Boxer approaches you...", "He asks, 'What brings you here?'", "Look for food.").
- **Narrative Content:** The 'narrative' field must contain the descriptive story text, INCLUDING any dialogue spoken by characters TO the player. Use quotation marks for dialogue. **Do NOT include choice letters (A, B, C) or stand-alone questions within the 'narrative' string.**
- **Dialogue:** Integrate dialogue naturally. Characters present can speak TO the player character. Dialogue can lead into a question or a set of choices. Make it clear who is speaking (e.g., "Clover nudges you gently. 'Lost, little one?' she asks.").
- **Choice Content:** Button choice text should represent immediate actions the player can take, written concisely in the second person.

RULES:
- Adhere strictly to the novel's plot, characters (personalities, motivations), setting, and Orwellian tone.
- **Acknowledge User Input:** If the player provided text input, the START of your generated 'narrative' MUST briefly acknowledge it before continuing (e.g., "Thinking about [summary], you then hear...").
- Generate narrative describing what happens *after* any acknowledgment. Remember the STYLE GUIDE.
- **Decide Next Interaction:** Based on the narrative context:
    - Use **'button_choice'** when the player needs to make a concrete decision about where to go, what to do, or how to react physically (e.g., Approach Boxer? Hide? Investigate the noise?). Generate 2-3 relevant choices following the STYLE GUIDE.
    - Use **'text_input'** when prompting for reflection, opinion, or understanding, OR when a character asks the player an open-ended question directly in dialogue. Generate a clear question following the STYLE GUIDE.
    - **Vary the interaction type** to keep the experience engaging. Don't ask text questions every single turn unless contextually necessary.
- Determine the updated narrative state.
- Respond ONLY with a valid JSON object adhering to the specified format.`;


// --- JSON_OUTPUT_FORMAT_INSTRUCTIONS (Updated Comments) ---
const JSON_OUTPUT_FORMAT_INSTRUCTIONS = `OUTPUT FORMAT (Valid JSON Object):
{
  "narrative": "string (Story description, including any dialogue TO the player. Second-person present tense. No choices/stand-alone questions here.)",
  "interactionType": "text_input" | "button_choice",
  "choices": [ // Include ONLY if interactionType is "button_choice"
    { "choice_id": "string", "text": "string (Button text - Second-person present action)" }
  ],
  "question": "string (The question text - Second-person present tense. Can be implied by dialogue in narrative. Include ONLY if interactionType is 'text_input')",
  "newState": { // The updated state for the *next* turn
    "novelSlug": "string",
    "currentLocationDesc": "string",
    "charactersPresent": ["string"],
    "plotPointsAchieved": ["string"],
    "recentThemes": ["string"],
    "turnCount": number
  }
}`;

/**
 * Builds the prompt for the initial phase (remains the same).
 * Assumes initial nodes provide button choices.
 */
export function buildInitialPrompt(nodeHint: string, outcomeHint?: string): string {
    const initialSystemPrompt = `You are generating narrative for a Choose Your Own Adventure based on Animal Farm. The player is a new animal.
STYLE GUIDE: Write ONLY narrative text from the player's perspective using the second-person present tense (e.g., "You walk...", "You see..."). Keep the tone Orwellian. Respond only with the narrative text.

Based on the context below, describe the scene according to the STYLE GUIDE.`;
    const context = `${outcomeHint ? `CONTEXT: The previous choice resulted in: "${outcomeHint}".\n` : ''}CONTEXT: The scene to describe is: ${nodeHint}`;
    return `${initialSystemPrompt}\n\n${context}`;
}


/**
 * Builds the complex prompt for the main LLM-driven phase.
 * Updated instructions for dialogue and interaction variety.
 */
export function buildNarrativeDirectorPrompt(
    currentState: NarrativeState,
    userInput: { choiceId?: string | null; responseText?: string | null; }
): string {

    // Prepare Contextual Info (Remains the same)
    const characters: Character[] = getCharactersByIds(currentState.novelSlug, currentState.charactersPresent);
    const themes: Theme[] = getThemesByIds(currentState.novelSlug, currentState.recentThemes);
    let characterInfo = "None relevant."; if (characters.length > 0) { characterInfo = characters.map(c => `${c.name} (${c.role || c.species || 'N/A'}): Personality: ${c.key_traits?.join(', ') || 'Unknown'}. Allegory: ${c.allegorical_figure || 'None'}.`).join('\n'); } // Added more detail
    let themeInfo = "None prominent."; if (themes.length > 0) { themeInfo = themes.map(t => `${t.name}: ${t.description}`).join('\n'); }

    // Format User Input Description (Context Only)
    let lastActionContext = "CONTEXT: This is the first turn after the initial setup phase.";
    if (userInput.responseText) { lastActionContext = `CONTEXT: The player previously responded with text: "${userInput.responseText}"`; }
    else if (userInput.choiceId) { lastActionContext = `CONTEXT: The player previously chose an action represented by internal ID: ${userInput.choiceId}.`; }

    // Assemble Prompt
    const prompt = `${SYSTEM_PROMPT_BASE}

${JSON_OUTPUT_FORMAT_INSTRUCTIONS}

CURRENT SITUATION (Turn ${currentState.turnCount}):
Novel: ${currentState.novelSlug}
Location: ${currentState.currentLocationDesc}
Characters Present: ${currentState.charactersPresent.join(', ') || 'None'}
Plot Points Achieved: ${currentState.plotPointsAchieved.join(', ') || 'None'}
Recent Themes: ${currentState.recentThemes.join(', ') || 'None'}

${lastActionContext} // Background context about the last action

AVAILABLE REFERENCE INFO:
Characters:
${characterInfo}
Themes:
${themeInfo}

YOUR TASK:
Strictly follow the STYLE GUIDE and OUTPUT FORMAT.
1. **Acknowledge Input:** If the player provided text input (see CONTEXT), start the 'narrative' by briefly acknowledging it.
2. **Generate Narrative:** Continue the narrative, describing the scene and events. Include dialogue FROM characters TO the player character where appropriate.
3. **Decide Interaction:** Choose the next interaction ('button_choice' for concrete actions/decisions, 'text_input' for reflection or responding to a character's question). VARY the interaction type occasionally.
4. **Provide Interaction Content:** If 'button_choice', provide 2-3 choices. If 'text_input', provide the question (this might be explicitly asked in the narrative dialogue).
5. **Update State:** Determine the 'newState' object reflecting changes.
6. Output ONLY the valid JSON object.`;

    return prompt;
}