
export enum Role {
  FORENSIC_SCIENTIST = 'Forensic Scientist',
  MURDERER = 'Murderer',
  INVESTIGATOR = 'Investigator',
  ACCOMPLICE = 'Accomplice',
  WITNESS = 'Witness'
}

export enum CardType {
  MEANS = 'MEANS', // Red cards (Murder Weapon)
  EVIDENCE = 'EVIDENCE' // Blue cards (Key Evidence)
}

export interface Card {
  id: string;
  name: string; // English name as key
  type: CardType;
  image?: string;
}

export interface Player {
  id: string;
  name: string;
  role: Role;
  isHost: boolean;
  cards: Card[];
  hasBadge: boolean; // Can they accuse?
  isReady: boolean;
  isMuted?: boolean;    // New: Microphone status
  isSpeaking?: boolean; // New: Visual indicator for voice
  avatarColor?: string; // New: User preferred avatar color
}

export interface SceneTileData {
  id: string;
  name: string;
  options: string[];
  selectedOptionIndex: number | null; // -1 if none, 0-5 for options
  isNew?: boolean; // Highlight newly added tiles
}

export enum GamePhase {
  LOBBY = 'LOBBY',
  ROLE_REVEAL = 'ROLE_REVEAL',
  NIGHT_PHASE = 'NIGHT_PHASE', // Murderer chooses cards
  INVESTIGATION = 'INVESTIGATION', // Scientist places clues
  POST_ROUND_VOTING = 'POST_ROUND_VOTING', // New: 30s Overtime to Accuse or Pass
  REPLACE_TILE = 'REPLACE_TILE', // Scientist chooses a tile to remove (Round 2 & 3)
  GAME_OVER = 'GAME_OVER'
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface RoomSettings {
  maxPlayers: number;
  includeAccomplice: boolean;
  includeWitness: boolean;
  roundTimeSeconds: number;
}

export type Language = 'en' | 'vi';

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  activePlayerId: string; // "Self" for this simulation
  
  // Roles
  forensicScientistId: string;
  murdererId: string;
  accompliceId?: string;
  witnessId?: string;
  
  // Game Data
  solution: {
    murdererId: string;
    meansId: string; // Card ID
    evidenceId: string; // Card ID
  } | null;
  
  // Investigation Data
  sceneTiles: SceneTileData[];
  causeOfDeathTile: SceneTileData;
  availableSceneTiles: SceneTileData[]; // Deck of tiles
  currentRound: number; // 1, 2, or 3
  
  winner: 'POLICE' | 'MURDERER' | null;
  winReason?: string;
  
  chatMessages: ChatMessage[];
  language: Language;
  
  // New: AI Narrative Data
  aiNarrative?: string; // The generated story/police report
  isGeneratingNarrative?: boolean; // Loading state for narrative
}
