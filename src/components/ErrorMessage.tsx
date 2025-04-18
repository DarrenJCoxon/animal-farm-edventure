// src/components/ErrorMessage.tsx
import React from 'react';
import styled from 'styled-components';

const ErrorBox = styled.div`
  color: red;
  border: 1px solid red;
  background-color: #ffebeb;
  padding: 1rem;
  margin-bottom: 1rem;
`;

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return <ErrorBox>Error: {message}</ErrorBox>;
};

export default ErrorMessage;