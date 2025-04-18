// src/lib/llm/index.ts
import { OLLAMA_MODEL } from '../config'; // Import is used by modelName below

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string; // The generated text
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaErrorResponse {
    error: string;
}

/**
 * Calls the local Ollama API to generate text based on a prompt.
 * @param prompt - The input prompt for the LLM.
 * @returns The generated text response from Ollama.
 * @throws Will throw an error if the API call fails or returns an error structure.
 */
export async function callOllamaApi(prompt: string): Promise<string> { // <--- Parameter 'prompt' is used below
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
  const modelName = OLLAMA_MODEL; // <--- OLLAMA_MODEL is used here

  console.log(`Sending prompt to Ollama (${modelName}):\n---\n${prompt}\n---`);

  try {
    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt, // <--- Parameter 'prompt' is used here
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Ollama API Error Response:", errorBody);
      throw new Error(`Ollama API request failed with status ${response.status}: ${errorBody}`);
    }

    // Type assertion uses the interfaces
    const result = await response.json() as OllamaGenerateResponse | OllamaErrorResponse; // <--- Interfaces used here

    if ('error' in result) {
        console.error("Ollama returned an error:", result.error);
        throw new Error(`Ollama API returned an error: ${result.error}`);
    }

    if (result.response) {
        console.log("Ollama generated response successfully.");
        return result.response.trim(); // <--- Function returns a string here
    } else {
        console.error("Ollama response did not contain expected 'response' field:", result);
        throw new Error("Invalid response structure from Ollama API.");
    }

  } catch (error) {
    console.error('Error calling Ollama API:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to get response from LLM: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while contacting the LLM.');
    }
  }
  // Note: The function *will* return or throw before reaching here, satisfying TS.
}