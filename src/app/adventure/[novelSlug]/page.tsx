// src/app/adventure/[novelSlug]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams } from 'next/navigation'; // Correct import for App Router

// Import types
import type { NarrativeState, Choice, AdventureApiRequest, AdventureApiResponse } from '../../../lib/types';

// Import UI components
import NarrativeDisplay from '../../../components/NarrativeDisplay';
import ChoiceButton from '../../../components/ChoiceButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';
import TextInputQuery from '../../../components/TextInputQuery';

// --- Styled Components ---
const AdventureContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
`;
const ChoicesContainer = styled.div` margin-top: 2rem; `;
const Header = styled.h1` text-align: center; margin-bottom: 2rem; color: #333; `;
const NarrativeAndInteraction = styled.div` min-height: 150px; `;
const QuestionText = styled.p` font-style: italic; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #444; `;
// --- End Styled Components ---

// --- Minimal Child Component for Testing useParams ---
// (Can be removed once main component works)
const ParamTester: React.FC = () => {
  const params = useParams();
  console.log("CLIENT (ParamTester): Rendering, params:", params);
  // Use the consistent camelCase 'novelSlug' here
  const slug = params && typeof params.novelSlug === 'string' ? params.novelSlug : 'ParamTester: Slug not found';
  return <p style={{ fontSize: '0.8em', color: 'grey', marginTop: '20px', borderTop: '1px dashed grey', paddingTop: '10px' }}>Param Tester: Slug = {slug}</p>;
};
// --------------------------------------------------

// --- Page Component ---
const AdventurePage: React.FC = () => {
  // State variables
  const [currentNarrativeState, setCurrentNarrativeState] = useState<NarrativeState | null>(null);
  const [displayedNarrative, setDisplayedNarrative] = useState<string>("");
  const [currentInteractionType, setCurrentInteractionType] = useState<'button_choice' | 'text_input' | null>(null);
  const [currentChoices, setCurrentChoices] = useState<Choice[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  console.log("CLIENT (AdventurePage): Rendering, current params:", params);

  // Derive novelSlug using consistent camelCase 'novelSlug'
  const novelSlug = params && typeof params.novelSlug === 'string' ? params.novelSlug : '';
  console.log("CLIENT (AdventurePage): Derived novelSlug:", novelSlug);

  // updateAdventure function
  const updateAdventure = useCallback(async (
      action: { choiceId?: string | null; responseText?: string | null } = {}
    ) => {
        console.log("CLIENT: updateAdventure function called with action:", action);
        // Check derived novelSlug before proceeding
        if (!novelSlug) {
            console.error("CLIENT: updateAdventure called but novelSlug is invalid/empty.");
            setError("Cannot process request: Invalid adventure specified in URL.");
            setIsLoading(false); return;
        }

        setIsLoading(true); setError(null);
        setCurrentInteractionType(null); setCurrentChoices([]); setCurrentQuestion(undefined);

        const requestBody: AdventureApiRequest = {
            currentNovelSlug: novelSlug, // Use derived camelCase slug
            currentState: currentNarrativeState,
            selectedChoiceId: action.choiceId,
            userResponseText: action.responseText,
        };
        console.log("CLIENT: Sending request to API:", JSON.stringify(requestBody, null, 2));

        try {
            const response = await fetch('/api/adventure', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
            const responseBodyText = await response.text();
            console.log("CLIENT: Raw API Response Text:", responseBodyText);
            if (!response.ok) {
                let errorMsg = `API request failed with status ${response.status}`;
                try { const errorData = JSON.parse(responseBodyText); errorMsg = errorData.error || errorMsg; }
                catch { errorMsg = `${errorMsg}: ${responseBodyText}`; }
                throw new Error(errorMsg);
            }
            const data: AdventureApiResponse = JSON.parse(responseBodyText);
            console.log("CLIENT: API Response Parsed:", data);
            if (data.error) { throw new Error(data.error); }
            setCurrentNarrativeState(data.newState); setDisplayedNarrative(data.narrativeText);
            setCurrentInteractionType(data.interactionType); setCurrentChoices(data.choices || []); setCurrentQuestion(data.question);
            console.log("CLIENT: State updated successfully. New Turn:", data.newState.turnCount);
        } catch (err) {
            console.error('CLIENT: Failed to update adventure state:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred processing the response.');
        } finally { setIsLoading(false); }
    }, [novelSlug, currentNarrativeState]); // Dependencies


  // Effect for initial load
  useEffect(() => {
    console.log("CLIENT (useEffect): Running effect, current params:", params);
    // Use consistent camelCase 'novelSlug' here
    const slugFromParams = params && typeof params.novelSlug === 'string' ? params.novelSlug : null;
    console.log("CLIENT (useEffect): Slug derived inside effect:", slugFromParams);

    if (slugFromParams) {
      console.log(`CLIENT (useEffect): Condition met. Slug: ${slugFromParams}. Checking if state is null...`);
      if (currentNarrativeState === null) {
          console.log("CLIENT (useEffect): State is null, calling updateAdventure.");
          updateAdventure(); // Call initial fetch
      } else { console.log("CLIENT (useEffect): State already exists, skipping fetch."); }
    } else { console.warn("CLIENT (useEffect): Condition NOT met. Slug from params is still not valid. Skipping fetch."); }
  // Depend on the 'params' object itself to trigger when it hydrates
  }, [params, updateAdventure, currentNarrativeState]); // Added currentNarrativeState to prevent refetch if state already loaded


  // Handlers
  const handleChoiceButtonClick = (choiceId: string) => { if (!isLoading) { updateAdventure({ choiceId }); } };
  const handleTextInputSubmit = (inputText: string) => { if (!isLoading) { updateAdventure({ responseText: inputText }); } };

  // --- Render Logic ---
   if (isLoading && !currentNarrativeState && !error) { return ( <AdventureContainer> <Header>Literary Edventures: {novelSlug || 'Loading...'}</Header> <LoadingSpinner /> <ParamTester/> </AdventureContainer> ); }
   if (error) { return ( <AdventureContainer> <Header>Literary Edventures: {novelSlug || 'Error'}</Header> <ErrorMessage message={error} /> {!currentNarrativeState && novelSlug && <button onClick={() => updateAdventure()}>Try Again</button>} <ParamTester/> </AdventureContainer> ); }
   if (!currentNarrativeState) { return ( <AdventureContainer> <Header>Literary Edventures: {novelSlug || 'Error'}</Header> <ErrorMessage message="Failed to load adventure state. Please check the URL or try refreshing."/> <ParamTester/> </AdventureContainer> ); }
   return ( <AdventureContainer> <Header>Literary Edventures: {novelSlug} (Turn: {currentNarrativeState.turnCount})</Header> <NarrativeAndInteraction> <NarrativeDisplay text={displayedNarrative} /> {currentInteractionType === 'text_input' && currentQuestion && !isLoading && ( <QuestionText>{currentQuestion}</QuestionText> )} {isLoading ? ( <LoadingSpinner /> ) : ( <ChoicesContainer> {currentInteractionType === 'button_choice' ? ( currentChoices.length > 0 ? currentChoices.map((choice) => ( <ChoiceButton key={choice.choice_id} choiceId={choice.choice_id} text={choice.text} onClick={handleChoiceButtonClick} disabled={isLoading} /> )) : <p>No choices available for this step.</p> ) : currentInteractionType === 'text_input' ? ( <TextInputQuery onSubmit={handleTextInputSubmit} disabled={isLoading} /> ) : ( <p>Loading interaction...</p> )} </ChoicesContainer> )} </NarrativeAndInteraction> <ParamTester/> </AdventureContainer> );
};

export default AdventurePage;