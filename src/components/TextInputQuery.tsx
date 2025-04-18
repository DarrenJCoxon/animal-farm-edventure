// src/components/TextInputQuery.tsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  margin-top: 1.5rem;
`;

const TextInput = styled.textarea`
  display: block;
  width: 100%;
  min-height: 80px; // Slightly larger
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical; // Allow vertical resizing

  &:focus {
    border-color: #555;
    outline: none;
    box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.2);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  background-color: #333; // Consider using theme variables later
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #555;
  }

  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
`;

interface TextInputQueryProps {
  onSubmit: (inputText: string) => void;
  disabled?: boolean;
}

const TextInputQuery: React.FC<TextInputQueryProps> = ({ onSubmit, disabled }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for focus

  // Focus the textarea when the component mounts (if not disabled)
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    const trimmedText = text.trim();
    if (!disabled && trimmedText) {
      onSubmit(trimmedText);
      setText(''); // Clear input after submit
    }
  };

  return (
    <InputContainer>
      <form onSubmit={handleSubmit}>
        <TextInput
          ref={textareaRef} // Assign ref
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What are your thoughts?" // More engaging placeholder
          disabled={disabled}
          rows={3} // Start with 3 rows
        />
        <SubmitButton type="submit" disabled={disabled || !text.trim()}>
          Submit Response
        </SubmitButton>
      </form>
    </InputContainer>
  );
};

export default TextInputQuery;