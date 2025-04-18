// src/lib/types/api.ts
import type { Choice, NarrativeState } from './adventure';

// Sent from Client to API (Keep as before)
export interface AdventureApiRequest {
  currentNovelSlug: string;
  currentState: NarrativeState | null;
  selectedChoiceId?: string | null;
  userResponseText?: string | null;
}

// --- NEW: Interface describing the JSON structure we expect FROM the LLM ---
export interface LlmDirectorResponse {
    narrative: string; // Expect 'narrative' from LLM
    interactionType: 'button_choice' | 'text_input';
    choices?: Choice[]; // Optional, only if button_choice
    question?: string;  // Optional, only if text_input
    newState: NarrativeState; // Expect the full new state object
}
// -------------------------------------------------------------------------

// Sent from API back to Client (Keep as before - uses 'narrativeText')
export interface AdventureApiResponse {
  narrativeText: string; // Final response uses 'narrativeText'
  interactionType: 'button_choice' | 'text_input';
  choices?: Choice[];
  question?: string;
  newState: NarrativeState;
  error?: string;
}