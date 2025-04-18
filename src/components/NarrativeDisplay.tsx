// src/components/NarrativeDisplay.tsx
import React from 'react';
import styled from 'styled-components';

const NarrativeContainer = styled.div`
  margin-bottom: 2rem;
  line-height: 1.6;
  white-space: pre-wrap; /* Preserve line breaks from LLM */
`;

interface NarrativeDisplayProps {
  text: string;
}

const NarrativeDisplay: React.FC<NarrativeDisplayProps> = ({ text }) => {
  return <NarrativeContainer>{text}</NarrativeContainer>;
};

export default NarrativeDisplay;