// src/app/api/adventure/route.ts
import { NextResponse } from 'next/server';
// Import the new LlmDirectorResponse type
import type {
    AdventureApiRequest,
    AdventureApiResponse,
    NarrativeState,
    AdventureNode,
    Choice,
    LlmDirectorResponse // Import the new type
} from '../../../lib/types';
import {
    getInitialNarrativeState,
    getInitialNode,
    getInitialPhaseNodeById
} from '../../../lib/data/loadData';
import { callOllamaApi } from '../../../lib/llm';
import { buildInitialPrompt, buildNarrativeDirectorPrompt } from '../../../lib/llm/promptBuilder';

const INITIAL_PHASE_NODE_IDS: string[] = ['node_0_start', 'node_1_barn_approach', 'node_2_jones_observation'];
const TRANSITION_NODE_ID: string = 'node_4_barn_eavesdrop';

// Helper function to clean LLM JSON output (remains the same)
function cleanLlmJsonResponse(rawResponse: string): string {
    console.log("API Cleaning raw LLM response:", rawResponse);
    let cleaned = rawResponse.trim();
    cleaned = cleaned.replace(/^```json\s*/, '');
    cleaned = cleaned.replace(/```$/, '');
    cleaned = cleaned.trim();
    console.log("API Cleaned LLM response:", cleaned);
    return cleaned;
}

export async function POST(request: Request) {
  console.log("--- API REQUEST RECEIVED ---");

  let requestBody: AdventureApiRequest;
  try { requestBody = await request.json(); console.log("API Request Body:", JSON.stringify(requestBody, null, 2)); }
  catch (error) { console.error('API Failed to parse request body:', error); return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  const { currentNovelSlug, currentState, selectedChoiceId, userResponseText } = requestBody;

  if (!currentNovelSlug) { console.error("API Error: Missing currentNovelSlug"); return NextResponse.json({ error: 'Missing currentNovelSlug' }, { status: 400 }); }
  console.log(`API Processing Request: Slug=${currentNovelSlug}`);

  // --- Initial Request Logic (remains the same) ---
  if (currentState === null) {
    // ... (Keep initial request logic exactly as before) ...
    console.log("API Handling Initial Request (currentState is null)");
    let initialNode: AdventureNode | null = null; let initialState: NarrativeState | null = null;
    try { console.log("API Calling getInitialNode..."); initialNode = getInitialNode(currentNovelSlug); console.log("API getInitialNode returned:", initialNode ? `Node ID: ${initialNode.node_id}` : 'null'); console.log("API Calling getInitialNarrativeState..."); initialState = getInitialNarrativeState(currentNovelSlug); console.log("API getInitialNarrativeState returned:", initialState ? 'State Object Received' : 'null'); } catch (error) { console.error("API Error during initial data loading (getInitialNode/State):", error); return NextResponse.json({ error: 'Error loading initial adventure data.' }, { status: 500 }); }
    if (!initialNode || !initialState) { console.error("API Failed to get valid initial node or state object after calls."); if (!initialNode) console.error("API Initial Node was null or undefined."); if (!initialState) console.error("API Initial State was null or undefined."); return NextResponse.json({ error: 'Failed to initialize adventure (missing node or state).' }, { status: 500 }); }
    console.log("API Initial Node & State retrieved successfully.");
    let initialPrompt: string = "";
    try { console.log("API Calling buildInitialPrompt..."); if (!initialNode.setting_description_prompt_hint) { throw new Error("Initial node is missing 'setting_description_prompt_hint'."); } initialPrompt = buildInitialPrompt(initialNode.setting_description_prompt_hint); console.log("API Initial prompt built successfully."); } catch (error) { console.error("API Error during initial prompt building:", error); return NextResponse.json({ error: 'Error building initial prompt.' }, { status: 500 }); }
    let initialNarrative: string = "";
    try { console.log("API Calling LLM for initial narrative..."); initialNarrative = await callOllamaApi(initialPrompt); console.log("API Initial narrative received from LLM."); } catch (error) { console.error("API LLM call failed for initial narrative:", error); return NextResponse.json({ error: `LLM failed to generate initial narrative: ${error instanceof Error ? error.message : 'Unknown LLM error'}` }, { status: 500 }); }
    const response: AdventureApiResponse = { narrativeText: initialNarrative, interactionType: initialNode.interaction_type, choices: initialNode.choices, newState: initialState };
    console.log("API Responding with initial state and narrative.");
    return NextResponse.json(response);
  }

  // --- Subsequent Request Logic (remains mostly the same structure) ---
  console.log("API Handling Subsequent Request Logic...");
  let useLLMDirector = false; let nextNodeIdForInitialPhase: string | null = null; let initialPhaseOutcomeHint: string | undefined; let nextNodeForInitialPhase: AdventureNode | null = null;
  if (userResponseText) { console.log("API Detected userResponseText, using LLM Director."); useLLMDirector = true; }
  else if (selectedChoiceId) { /* ... (keep existing logic to determine useLLMDirector based on choice) ... */
     console.log(`API Processing selectedChoiceId: ${selectedChoiceId}`); let foundChoice: Choice | null = null;
     for (const potentialPrevNodeId of INITIAL_PHASE_NODE_IDS) { const potentialPrevNode = getInitialPhaseNodeById(currentNovelSlug, potentialPrevNodeId); foundChoice = potentialPrevNode?.choices?.find(c => c.choice_id === selectedChoiceId) || null; if (foundChoice) { console.log(`API Found choice ${selectedChoiceId} on initial node ${potentialPrevNodeId}`); nextNodeIdForInitialPhase = foundChoice.next_node_id || null; initialPhaseOutcomeHint = foundChoice.llm_outcome_hint; break; } }
     if (nextNodeIdForInitialPhase) { console.log(`API Choice leads to node ID: ${nextNodeIdForInitialPhase}`); nextNodeForInitialPhase = getInitialPhaseNodeById(currentNovelSlug, nextNodeIdForInitialPhase); if (nextNodeForInitialPhase && INITIAL_PHASE_NODE_IDS.includes(nextNodeIdForInitialPhase)) { console.log("API Next node is within the initial phase. Using fixed logic."); useLLMDirector = false; } else if (nextNodeForInitialPhase && nextNodeIdForInitialPhase === TRANSITION_NODE_ID) { console.log("API Next node is the transition node. Using fixed logic for THIS turn."); useLLMDirector = false; } else { console.log("API Next node is beyond initial phase or transition. Using LLM Director."); useLLMDirector = true; } } else { console.log("API Choice ID not found in initial nodes or leads nowhere defined initially. Assuming LLM Director phase."); useLLMDirector = true; }
  } else { console.error("API Error: Subsequent request with no userResponseText or selectedChoiceId."); return NextResponse.json({ error: 'Invalid request state: missing user input.' }, { status: 400 }); }


  // --- Execute Logic based on phase ---
  if (!useLLMDirector && nextNodeForInitialPhase) {
    // Initial Phase Button Click Logic (keep as before)
    console.log("API Executing Initial Phase Logic for node:", nextNodeForInitialPhase.node_id);
    const initialPrompt = buildInitialPrompt(nextNodeForInitialPhase.setting_description_prompt_hint, initialPhaseOutcomeHint);
    let narrative: string;
    try { console.log("API Calling LLM for initial phase narrative..."); narrative = await callOllamaApi(initialPrompt); console.log("API Initial phase narrative received."); } catch (error) { console.error("API LLM call failed during initial phase:", error); return NextResponse.json({ error: 'LLM failed during initial phase' }, { status: 500 }); }
    const updatedState: NarrativeState = { /*... (state update logic as before) ...*/ novelSlug:currentState.novelSlug, currentLocationDesc: nextNodeForInitialPhase.title || `Arrived at ${nextNodeForInitialPhase.node_id}`, charactersPresent: nextNodeForInitialPhase.characters_present || currentState.charactersPresent, plotPointsAchieved: currentState.plotPointsAchieved, recentThemes: nextNodeForInitialPhase.pedagogical_focus || currentState.recentThemes, turnCount: currentState.turnCount + 1 };
    const response: AdventureApiResponse = { narrativeText: narrative, interactionType: nextNodeForInitialPhase.interaction_type, choices: nextNodeForInitialPhase.choices, question: nextNodeForInitialPhase.question_prompt, newState: updatedState };
    console.log("API Responding for initial phase step.");
    return NextResponse.json(response);

  } else {
      // ================================================
      // === LLM-Driven Narrative Director Phase ===
      // ================================================
      console.log("API Executing Narrative Director Logic");

      const prompt = buildNarrativeDirectorPrompt(currentState, { choiceId: selectedChoiceId, responseText: userResponseText });
      let llmResponseString: string;
      try { console.log("API Calling LLM with director prompt..."); llmResponseString = await callOllamaApi(prompt); console.log("API LLM Raw Response received."); }
      catch (error) { console.error("API LLM call failed for director phase:", error); return NextResponse.json({ error: `LLM failed to direct narrative: ${error instanceof Error ? error.message : 'Unknown LLM error'}` }, { status: 500 }); }

      let cleanedLlmResponse: string | undefined; // Initialize to undefined
      let llmJsonResponse: LlmDirectorResponse; // Use the specific LLM response type
      try {
          cleanedLlmResponse = cleanLlmJsonResponse(llmResponseString);
          // JSON.parse returns 'any', so we cast it to our specific expected type
          llmJsonResponse = JSON.parse(cleanedLlmResponse) as LlmDirectorResponse;
          console.log("API Successfully parsed cleaned LLM JSON response.");

      } catch (error) {
          console.error("API Failed to parse LLM JSON response after cleaning:", error);
          console.error("LLM Raw Output (before cleaning):", llmResponseString);
          // Log cleaned string only if it was successfully assigned
          if (typeof cleanedLlmResponse !== 'undefined') {
              console.error("Attempted Cleaned Output:", cleanedLlmResponse);
          }
          return NextResponse.json({ error: `Failed to parse LLM response JSON: ${error instanceof Error ? error.message : 'Unknown parsing error'}` }, { status: 500 });
      }

      // --- Validate the parsed JSON structure (using LlmDirectorResponse type) ---
      try {
          // Check required fields based on LlmDirectorResponse type
          if (!llmJsonResponse.narrative || // Check 'narrative'
              !llmJsonResponse.interactionType ||
              !llmJsonResponse.newState) {
              throw new Error("LLM JSON response missing required fields (narrative, interactionType, newState).");
          }
          if (llmJsonResponse.interactionType === 'button_choice' && (!llmJsonResponse.choices || !Array.isArray(llmJsonResponse.choices))) {
               console.warn("LLM JSON response is 'button_choice' but 'choices' array is missing or invalid. Proceeding with empty choices.");
               llmJsonResponse.choices = [];
          }
          if (llmJsonResponse.interactionType === 'text_input' && typeof llmJsonResponse.question !== 'string') {
                if (llmJsonResponse.question === undefined || llmJsonResponse.question === null) {
                    throw new Error("LLM JSON response is 'text_input' but 'question' string is missing.");
                 }
          }
          // Basic validation of newState structure
          const ns = llmJsonResponse.newState; // Alias for brevity
          if (typeof ns.turnCount !== 'number' || typeof ns.currentLocationDesc !== 'string' ||
              !Array.isArray(ns.charactersPresent) || !Array.isArray(ns.plotPointsAchieved) ||
              !Array.isArray(ns.recentThemes)) {
              throw new Error("LLM JSON response 'newState' object has incorrect structure or missing fields.");
          }

          // --- Ensure state consistency (override LLM if needed) ---
          if (ns.turnCount !== currentState.turnCount + 1) { console.warn(`LLM newState turnCount (${ns.turnCount}) is incorrect. Overriding to ${currentState.turnCount + 1}.`); ns.turnCount = currentState.turnCount + 1; }
          if (ns.novelSlug !== currentNovelSlug) { console.warn(`LLM changed novelSlug in newState (${ns.novelSlug}). Overriding to ${currentNovelSlug}.`); ns.novelSlug = currentNovelSlug; }

          // --- Construct final response using AdventureApiResponse type ---
          const response: AdventureApiResponse = {
              // Map the 'narrative' field from LLM output to 'narrativeText' for API response
              narrativeText: llmJsonResponse.narrative,
              interactionType: llmJsonResponse.interactionType,
              choices: llmJsonResponse.choices || [],
              question: llmJsonResponse.question,
              newState: ns, // Use the validated (and potentially corrected) newState
          };

          console.log("API Validation successful. Responding.");
          return NextResponse.json(response);

      } catch (validationError) {
           console.error("API Failed to validate LLM JSON response structure:", validationError);
           console.error("Parsed LLM JSON causing validation error:", JSON.stringify(llmJsonResponse, null, 2));
           return NextResponse.json({ error: `LLM response failed validation: ${validationError instanceof Error ? validationError.message : 'Unknown validation error'}` }, { status: 500 });
      }
  }
} // End of POST function