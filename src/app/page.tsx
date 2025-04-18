// src/app/page.tsx
'use client'; // Add this directive at the very top

import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

// --- Styled Components ---

const PageContainer = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  min-height: 100vh;
  background-color: #f8f9fa; // A light background
  font-family: sans-serif; // Simple default font
`;

const Header = styled.h1`
  color: #343a40; // Dark grey heading
  font-size: 2.8rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const IntroText = styled.p`
  color: #495057; // Slightly lighter text
  font-size: 1.1rem;
  max-width: 650px;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 3rem;
`;

const AdventuresSection = styled.section`
  width: 100%;
  max-width: 900px; // Limit width of the adventures list
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  color: #343a40;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #dee2e6; // Subtle separator
  padding-bottom: 0.5rem;
`;

const AdventureCard = styled.div`
  background-color: #ffffff; // White card background
  border: 1px solid #dee2e6; // Light border
  border-radius: 8px;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column; // Stack content vertically
  align-items: flex-start; // Align content to the left
`;

const AdventureTitle = styled.h3`
  color: #212529;
  font-size: 1.4rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
`;

const AdventureAuthor = styled.p`
    color: #6c757d; // Grey for author name
    font-size: 0.95rem;
    margin-bottom: 1rem;
`;

const AdventureDescription = styled.p`
    color: #495057;
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    flex-grow: 1; // Allow description to take up space if needed
`;

// Style the Next.js Link component like a button
const StartLink = styled(Link)`
  display: inline-block;
  background-color: #007bff; // Primary blue color
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.2s ease;
  align-self: flex-end; // Push button to the right/end

  &:hover {
    background-color: #0056b3; // Darker blue on hover
  }
`;

// --- Homepage Component ---

export default function HomePage() {
  // No client-side hooks (useState, useEffect) are used here currently,
  // but the 'use client' directive allows them to be added later if needed.
  return (
    <PageContainer>
      <Header>Welcome to Literary Edventures</Header>
      <IntroText>
        Explore classic literature in a whole new way. Step inside the story,
        make choices, reflect on themes, and deepen your understanding through
        an interactive, pedagogical journey powered by AI.
      </IntroText>

      <AdventuresSection>
        <SectionTitle>Available Edventures</SectionTitle>

        {/* Card for Animal Farm */}
        <AdventureCard>
          <AdventureTitle>Animal Farm</AdventureTitle>
          <AdventureAuthor>George Orwell</AdventureAuthor>
          <AdventureDescription>
            Witness the rise and fall of animal revolution on Manor Farm. Explore themes of power, corruption, and propaganda in this timeless allegory. Will you follow blindly, or question the pigs rule?
          </AdventureDescription>
          <StartLink href="/adventure/animal-farm">
            Start Edventure
          </StartLink>
        </AdventureCard>

        {/* Add more AdventureCard components here when you have more novels */}
        {/*
        <AdventureCard>
          <AdventureTitle>Coming Soon...</AdventureTitle>
          <AdventureDescription>
            More literary worlds are waiting to be explored!
          </AdventureDescription>
        </AdventureCard>
        */}

      </AdventuresSection>
    </PageContainer>
  );
}