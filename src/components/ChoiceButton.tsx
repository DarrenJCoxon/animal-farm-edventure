// src/components/ChoiceButton.tsx
import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  display: block;
  width: 100%;
  padding: 0.8rem 1.2rem;
  margin-bottom: 0.8rem;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  color: #333;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #eee;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

interface ChoiceButtonProps {
  choiceId: string;
  text: string;
  onClick: (choiceId: string) => void;
  disabled?: boolean;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ choiceId, text, onClick, disabled }) => {
  const handleClick = () => {
    if (!disabled) {
      onClick(choiceId);
    }
  };

  return (
    <Button onClick={handleClick} disabled={disabled}>
      {text}
    </Button>
  );
};

export default ChoiceButton;