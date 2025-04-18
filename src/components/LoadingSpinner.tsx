// src/components/LoadingSpinner.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #555;
  margin: 2rem auto;
  animation: ${spin} 1s linear infinite;
`;

const LoadingSpinner: React.FC = () => {
  return <Spinner />;
};

export default LoadingSpinner;