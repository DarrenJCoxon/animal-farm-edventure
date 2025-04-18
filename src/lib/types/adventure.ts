// src/lib/types/adventure.ts

// Basic metadata about the novel
export interface NovelMeta {
    title: string;
    author: string;
    publication_year: number;
    genre: string;
    brief_summary: string;
    core_allegory: string;
  }
  
  // Represents a character in the novel
  export interface Character {
    id: string; // Unique identifier (e.g., "mr_jones", "napoleon")
    name: string;
    species?: string;
    role?: string;
    allegorical_figure?: string;
    key_traits?: string[];
    motivations?: string[];
    pedagogical_notes?: string; // Why this character is important educationally
  }
  
  // Represents a major theme in the novel
  export interface Theme {
    id: string; // Unique identifier (e.g., "power_corruption")
    name: string;
    description: string;
    key_moments_in_novel?: string[];
    allegorical_link?: string;
    pedagogical_questions?: string[];
  }
  
  // Represents a section of contextual information
  export interface ContextSection {
    summary: string;
    relevance: string; // How it connects to the novel
    key_figures?: string[];
    features?: string[];
  }
  
  // Structure for historical context data
  export interface HistoricalContext {
    [key: string]: ContextSection; // e.g., russian_revolution: ContextSection
  }
  
  // Structure for literary context data
  export interface LiteraryContext {
    [key: string]: ContextSection; // e.g., allegory: ContextSection
  }
  
  // Combined context structure
  export interface NovelContext {
    historical: HistoricalContext;
    literary: LiteraryContext;
  }
  
  // Represents a reusable snippet of learning information
  export interface LearningContent {
    content_id: string;
    title: string;
    text: string;
    related_themes?: string[]; // Array of theme IDs
    related_context_keys?: string[]; // e.g., ["historical.russian_revolution", "literary.allegory"]
  }
  
  // Represents a choice the user can make (button) or LLM might generate
  // Added back next_node_id and llm_outcome_hint as optional for initial phase
  export interface Choice {
    choice_id: string; // Identifier
    text: string;      // Text displayed to the user
    next_node_id?: string;     // << ADDED BACK (Optional) ID of the next node (used ONLY in initial phase)
    llm_outcome_hint?: string; // << ADDED BACK (Optional) Hint for LLM (used ONLY in initial phase)
  }
  
  // Represents a node, primarily used for the initial button-driven phase now
  export interface AdventureNode {
    node_id: string; // Unique identifier for this node
    title?: string; // Optional title for organizational purposes
    interaction_type: 'button_choice' | 'text_input'; // Type of interaction expected
    setting_description_prompt_hint: string; // Guidance for LLM to set the scene
    question_prompt?: string; // Optional: Specific question to pose if type is text_input
    plot_relevance?: string; // Brief note on where this fits in the story
    characters_present?: string[]; // IDs of characters involved in this node
    pedagogical_focus?: string[]; // IDs of themes or concepts highlighted here
    choices: Choice[]; // Array of choices available at this node (now includes optional fields)
  }
  
  // State representing the current narrative situation (used in LLM-driven phase)
  export interface NarrativeState {
      novelSlug: string;
      currentLocationDesc: string; // Descriptive location, e.g., "Listening outside the barn door"
      charactersPresent: string[]; // IDs of characters currently involved
      plotPointsAchieved: string[]; // Key events encountered, e.g., "heard_meeting_whispers"
      recentThemes: string[]; // IDs of themes recently touched upon
      turnCount: number; // Track how many interactions have happened
      // Add other relevant state flags as needed
  }