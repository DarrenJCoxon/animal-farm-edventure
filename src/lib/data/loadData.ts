// src/lib/data/loadData.ts

// Assuming you have src/lib/types/index.ts exporting all types:
// export * from './adventure';
// export * from './api';
import {
    NovelMeta,
    Character,
    AdventureNode,
    NarrativeState,
    Theme,
    // Import other types like Context, LearningContent if needed
  } from '../types';
  
  // --- Data Imports ---
  // Ensure these paths are correct and the JSON files exist and are valid
  import animalFarmMetaData from './animal-farm/novel_meta.json';
  import animalFarmCharactersData from './animal-farm/characters.json';
  import animalFarmInitialNodesData from './animal-farm/adventure_nodes.json';
  // Assuming you create and populate themes.json:
  import animalFarmThemesData from './animal-farm/themes.json';
  
  // --- Type Assertions ---
  // These lines tell TypeScript to trust the structure of the imported JSON data.
  // If errors occur here, it means the JSON structure doesn't match the Type definition.
  const animalFarmMeta: NovelMeta = animalFarmMetaData as NovelMeta;
  const animalFarmCharacters: Character[] = animalFarmCharactersData as Character[];
  const animalFarmInitialNodes: AdventureNode[] = animalFarmInitialNodesData as AdventureNode[];
  const animalFarmThemes: Theme[] = animalFarmThemesData as Theme[];
  
  // --- Data Access Functions ---
  
  /**
   * Retrieves the metadata for a given novel slug.
   */
  export function getNovelMeta(novelSlug: string): NovelMeta | null {
    if (novelSlug === 'animal-farm') {
      return animalFarmMeta;
    }
    console.error(`[loadData] Novel metadata not found for slug: ${novelSlug}`);
    return null;
  }
  
  /**
   * Retrieves the initial NarrativeState for a novel.
   */
  export function getInitialNarrativeState(novelSlug: string): NarrativeState | null {
      if (novelSlug === 'animal-farm') {
          // Ensure 'mr_jones' exists in characters.json with an "id" field
          return {
              novelSlug: novelSlug,
              currentLocationDesc: "Just arrived at Manor Farm yard",
              charactersPresent: ["mr_jones"],
              plotPointsAchieved: [],
              recentThemes: [],
              turnCount: 0,
          };
      }
      console.error(`[loadData] Initial state not defined for novel slug: ${novelSlug}`);
      return null;
  }
  
  /**
   * Retrieves the specific starting AdventureNode (used only for the very first step).
   */
  export function getInitialNode(novelSlug: string): AdventureNode | null {
       if (novelSlug === 'animal-farm') {
          // Ensure node_id exists in your AdventureNode type definition
          const startNode = animalFarmInitialNodes.find(n => n.node_id === 'node_0_start');
          if (!startNode) {
               console.error("[loadData] Start node 'node_0_start' not found in adventure_nodes.json");
               return null;
          }
          // Validate that the start node must be a button choice type
          if (startNode.interaction_type !== 'button_choice') {
              console.error("[loadData] Start node 'node_0_start' must have interaction_type 'button_choice'");
              return null;
          }
          return startNode;
      }
      console.error(`[loadData] Initial node not determined for novel slug: ${novelSlug}`);
      return null;
  }
  
  /**
   * Retrieves a specific AdventureNode by ID, used only during the initial fixed-path phase.
   */
  export function getInitialPhaseNodeById(novelSlug: string, nodeId: string): AdventureNode | null {
      if (novelSlug === 'animal-farm') {
          // Ensure node_id exists in your AdventureNode type definition
          const node = animalFarmInitialNodes.find(n => n.node_id === nodeId);
          if (!node) {
              console.warn(`[loadData] Node with ID "${nodeId}" not found within initial phase nodes.`);
              return null; // Return null if not found, might be expected during transition
          }
          return node;
      }
      console.error(`[loadData] Cannot get node for novel slug: ${novelSlug} in initial phase`);
      return null;
  }
  
  /**
   * Retrieves a specific character by its ID.
   */
  export function getCharacterById(novelSlug: string, characterId: string): Character | null {
      if (novelSlug === 'animal-farm') {
          // Ensure 'id' property exists in Character type and characters.json
          const character = animalFarmCharacters.find((c) => c.id === characterId);
          if (!character) {
              // It's okay if a character isn't found sometimes, maybe warn if needed.
              // console.warn(`[loadData] Character with ID "${characterId}" not found for novel "${novelSlug}"`);
          }
          return character || null;
      }
      console.error(`[loadData] Character data not available for novel slug: ${novelSlug}`);
      return null;
  }
  
  /**
   * Retrieves multiple characters by their IDs.
   */
  export function getCharactersByIds(novelSlug: string, characterIds: string[]): Character[] {
      if (novelSlug === 'animal-farm') {
          if (!characterIds || characterIds.length === 0) {
              return []; // Handle empty input gracefully
          }
          // Ensure 'id' property exists in Character type and characters.json
          return animalFarmCharacters.filter(c => c.id && characterIds.includes(c.id)); // Added check for c.id existence for safety
      }
      console.error(`[loadData] Character data not available for novel slug: ${novelSlug}`);
      return [];
  }
  
  /**
   * Retrieves a specific theme by its ID.
   */
  export function getThemeById(novelSlug: string, themeId: string): Theme | null {
      if (novelSlug === 'animal-farm') {
          // Ensure 'id' property exists in Theme type and themes.json
          const theme = animalFarmThemes.find((t) => t.id === themeId);
          if (!theme) {
             // console.warn(`[loadData] Theme with ID "${themeId}" not found for novel "${novelSlug}"`);
          }
          return theme || null;
      }
      console.error(`[loadData] Theme data not available for novel slug: ${novelSlug}`);
      return null;
  }
  
  /**
   * Retrieves multiple themes by their IDs.
   */
  export function getThemesByIds(novelSlug: string, themeIds: string[]): Theme[] {
      if (novelSlug === 'animal-farm') {
           if (!themeIds || themeIds.length === 0) {
              return []; // Handle empty input gracefully
          }
          // Ensure 'id' property exists in Theme type and themes.json
          return animalFarmThemes.filter(t => t.id && themeIds.includes(t.id)); // Added check for t.id existence
      }
       console.error(`[loadData] Theme data not available for novel slug: ${novelSlug}`);
      return [];
  }
  
  // Add functions for loading Context, LearningContent etc. as needed following the same pattern.