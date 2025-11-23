
import React, { useState, useEffect, useRef } from 'react';
import { 
  GameState, Player, Role, GamePhase, Card, CardType, SceneTileData, Language, ChatMessage, RoomSettings 
} from './types';
import { 
  MEANS_CARDS, EVIDENCE_CARDS, SCENE_TILES, CAUSE_OF_DEATH_TILE, LOCATION_TILES, TRANSLATIONS 
} from './constants';
import { CardComponent } from './components/Card';
import { SceneTile } from './components/SceneTile';
import { GeminiAssistant } from './components/GeminiAssistant';
import { GuideModal } from './components/GuideModal';
import { generateCrimeSceneNarrative, evaluateClueQuality } from './services/geminiService';
import { 
  Play, Shield, Skull, Gavel, Eye, RefreshCcw, Users, Fingerprint, MessageSquare, Mic, MicOff, Volume2, VolumeX, Globe, LogOut, CheckCircle, X, User, Search, FlaskConical, Ghost, Palette, Moon, Settings, Clock, Hourglass, ArrowRight, AlertTriangle, BookOpen, Timer, Server, UserMinus, FileText, BrainCircuit, UserPlus, Radio, Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

// Mystic/Gemstone Avatar Colors
const AVATAR_COLORS = [
  'bg-slate-800 ring-slate-500', 
  'bg-stone-800 ring-stone-500',
  'bg-red-950 ring-red-800', 
  'bg-rose-950 ring-rose-800', 
  'bg-orange-950 ring-orange-800', 
  'bg-amber-950 ring-amber-700', 
  'bg-yellow-950 ring-yellow-700',
  'bg-lime-950 ring-lime-800',
  'bg-green-950 ring-green-800', 
  'bg-emerald-950 ring-emerald-800',
  'bg-teal-950 ring-teal-800', 
  'bg-cyan-950 ring-cyan-800', 
  'bg-sky-950 ring-sky-800', 
  'bg-blue-950 ring-blue-800', 
  'bg-indigo-950 ring-indigo-800', 
  'bg-violet-950 ring-violet-800', 
  'bg-purple-950 ring-purple-800', 
  'bg-fuchsia-950 ring-fuchsia-800', 
  'bg-pink-950 ring-pink-800', 
];

const App: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>({
    roomCode: '',
    phase: GamePhase.LOBBY,
    players: [],
    activePlayerId: '',
    forensicScientistId: '',
    murdererId: '',
    solution: null,
    sceneTiles: [],
    causeOfDeathTile: { ...CAUSE_OF_DEATH_TILE },
    availableSceneTiles: [],
    currentRound: 1,
    winner: null,
    chatMessages: [],
    language: 'vi' // Default to Vietnamese per prompt context
  });

  // User Preferences (Persisted)
  const [localPlayerName, setLocalPlayerName] = useState('');
  const [localAvatarColor, setLocalAvatarColor] = useState(AVATAR_COLORS[0]);

  const [userRoleView, setUserRoleView] = useState<Role | 'GOD'>(Role.FORENSIC_SCIENTIST); 
  const [nightSelection, setNightSelection] = useState<{ means: string | null, evidence: string | null }>({ means: null, evidence: null });
  const [accusationSelection, setAccusationSelection] = useState<{ suspectId: string | null, means: string | null, evidence: string | null }>({ suspectId: null, means: null, evidence: null });
  const [showAccusationModal, setShowAccusationModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0); // Timer state
  
  // Lobby Settings State
  const [roomSettings, setRoomSettings] = useState<RoomSettings>({
    maxPlayers: 6,
    includeAccomplice: false,
    includeWitness: false,
    roundTimeSeconds: 300
  });
  
  const [isJoinMode, setIsJoinMode] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  
  // Simulated Network State
  const [isProcessing, setIsProcessing] = useState(false);

  // Voice System State
  const [isMicOn, setIsMicOn] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Translations Helper
  const t = TRANSLATIONS[gameState.language];

  // --- Initialization ---
  
  // Load saved data from Cookies/LocalStorage on mount
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('mmo_username');
      const savedColor = localStorage.getItem('mmo_avatar_color');
      const savedSettings = localStorage.getItem('mmo_room_settings');
      
      if (savedName) {
        setLocalPlayerName(savedName);
      } else {
        const randomName = `Agent ${Math.floor(Math.random() * 1000)}`;
        setLocalPlayerName(randomName);
      }

      if (savedColor && AVATAR_COLORS.includes(savedColor)) {
        setLocalAvatarColor(savedColor);
      } else {
        setLocalAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
      }

      if (savedSettings) {
        setRoomSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.warn("LocalStorage access denied or error", e);
    }
  }, []);

  // Save room settings when they change
  useEffect(() => {
    try {
      localStorage.setItem('mmo_room_settings', JSON.stringify(roomSettings));
    } catch (e) {
      console.warn("Failed to save room settings", e);
    }
  }, [roomSettings]);

  const handleNameChange = (name: string) => {
    setLocalPlayerName(name);
    localStorage.setItem('mmo_username', name);
  };

  const handleColorChange = (color: string) => {
    setLocalAvatarColor(color);
    localStorage.setItem('mmo_avatar_color', color);
  };

  // --- Timer Logic ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if ((gameState.phase === GamePhase.INVESTIGATION || gameState.phase === GamePhase.POST_ROUND_VOTING) && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
             // Time runs out
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && gameState.phase === GamePhase.INVESTIGATION) {
      // Auto-switch to Voting when investigation time ends
       setGameState(prev => ({
         ...prev,
         phase: GamePhase.POST_ROUND_VOTING
       }));
       setTimeLeft(30); // 30s Overtime
    } else if (timeLeft === 0 && gameState.phase === GamePhase.POST_ROUND_VOTING) {
      // Auto-switch to next phase when voting ends
      nextPhase();
    }

    return () => clearInterval(interval);
  }, [timeLeft, gameState.phase]);

  // Pause timer if accusation modal is open during Voting
  useEffect(() => {
    if (showAccusationModal && gameState.phase === GamePhase.POST_ROUND_VOTING) {
       // Reset to 30s and hold (conceptually) - or strictly per requirement: reset to 30s.
       setTimeLeft(30);
    }
  }, [showAccusationModal, gameState.phase]);


  // --- Voice System Logic ---

  const toggleMic = async () => {
    if (isMicOn) {
      // Turn Off
      if (sourceRef.current) {
        sourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setIsMicOn(false);
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => p.id === prev.activePlayerId ? { ...p, isMuted: true, isSpeaking: false } : p)
      }));
    } else {
      // Turn On
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        setIsMicOn(true);
        setGameState(prev => ({
          ...prev,
          players: prev.players.map(p => p.id === prev.activePlayerId ? { ...p, isMuted: false } : p)
        }));

        detectAudioLevel();
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert(gameState.language === 'vi' ? "Không thể truy cập Microphone" : "Cannot access Microphone");
      }
    }
  };

  const detectAudioLevel = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
    
    const isSpeaking = average > 10;

    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === prev.activePlayerId ? { ...p, isSpeaking } : p)
    }));

    animationFrameRef.current = requestAnimationFrame(detectAudioLevel);
  };

  // Simulate other players speaking (Simple random for simulation)
  useEffect(() => {
    if (gameState.phase !== GamePhase.INVESTIGATION) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const randomPlayerIdx = Math.floor(Math.random() * prev.players.length);
        const player = prev.players[randomPlayerIdx];
        
        if (player.id === prev.activePlayerId && isMicOn) return prev;

        const shouldSpeak = Math.random() > 0.7;
        
        return {
          ...prev,
          players: prev.players.map((p, idx) => 
            (idx === randomPlayerIdx && p.id !== prev.activePlayerId) ? { ...p, isSpeaking: shouldSpeak } : p
          )
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.phase, isMicOn]);


  // --- Logic: Server/Lobby Management ---
  
  // NEW: Generate 6-Character Alphanumeric Code
  const generateRoomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createLobby = () => {
    setIsProcessing(true);
    // Simulate Server Creation Lag
    setTimeout(() => {
      const code = generateRoomCode();
      
      const hostPlayer: Player = {
        id: `p-${Date.now()}-host`,
        name: localPlayerName,
        role: Role.INVESTIGATOR,
        isHost: true,
        cards: [],
        hasBadge: true,
        isReady: true,
        isMuted: true,
        isSpeaking: false,
        avatarColor: localAvatarColor
      };

      setGameState(prev => ({ 
        ...prev, 
        roomCode: code, 
        players: [hostPlayer], // Only Host initially
        activePlayerId: hostPlayer.id 
      }));
      setIsProcessing(false);
    }, 800);
  };

  // Helper: Simulate a remote player joining the server
  const simulatePlayerJoin = () => {
    if (gameState.players.length >= roomSettings.maxPlayers) return;
    setIsProcessing(true);

    setTimeout(() => {
      const randomNames = ["Vinh", "Khoa", "Ngọc", "Thảo", "Hùng", "Lan", "Minh", "Tâm", "Alice", "Bob", "Charlie", "David"];
      const existingNames = gameState.players.map(p => p.name);
      const availableNames = randomNames.filter(n => !existingNames.includes(n));
      const name = availableNames.length > 0 ? availableNames[0] : `Guest ${Math.floor(Math.random() * 100)}`;

      const newPlayer: Player = {
        id: `p-${Date.now()}`,
        name: name,
        role: Role.INVESTIGATOR,
        isHost: false,
        cards: [],
        hasBadge: true,
        isReady: true,
        isMuted: true,
        isSpeaking: false,
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
      };

      setGameState(prev => ({
        ...prev,
        players: [...prev.players, newPlayer]
      }));
      setIsProcessing(false);
    }, 500);
  };

  const handleJoinRoom = () => {
    if (joinCodeInput.length !== 6) {
      alert(gameState.language === 'vi' ? "Mã phòng phải có 6 ký tự." : "Room code must be 6 characters.");
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => {
        const code = joinCodeInput.toUpperCase();
        
        // This is a simulation since we don't have a real backend in this environment.
        // We will create a fresh state as if we joined an existing room, but we have to mock the "Host" existing.
        
        const guestPlayer: Player = {
          id: `p-${Date.now()}-guest`,
          name: localPlayerName,
          role: Role.INVESTIGATOR,
          isHost: false, 
          cards: [],
          hasBadge: true,
          isReady: true,
          isMuted: true,
          isSpeaking: false,
          avatarColor: localAvatarColor
        };

        const mockHost: Player = {
          id: `p-host-mock`,
          name: "MCP (Host)",
          role: Role.INVESTIGATOR,
          isHost: true,
          cards: [],
          hasBadge: true,
          isReady: true,
          isMuted: true,
          avatarColor: AVATAR_COLORS[1]
        };

        setGameState(prev => ({ 
          ...prev, 
          roomCode: code, 
          players: [mockHost, guestPlayer],
          activePlayerId: guestPlayer.id 
        }));
        
        setIsJoinMode(false);
        setIsProcessing(false);
    }, 1000);
  };

  const handleKickPlayer = (playerId: string) => {
      if (confirm(gameState.language === 'vi' ? "Ngắt kết nối người chơi này?" : "Disconnect this player?")) {
           setGameState(prev => ({
               ...prev,
               players: prev.players.filter(p => p.id !== playerId)
           }));
      }
  };

  const startGame = () => {
    if (gameState.players.length < 4) {
      alert(gameState.language === 'vi' ? "Cần ít nhất 4 người chơi để bắt đầu." : "Need at least 4 players to start.");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
        // Reset Ephemeral State
        setNightSelection({ means: null, evidence: null });
        setAccusationSelection({ suspectId: null, means: null, evidence: null });

        const roles: Role[] = [Role.FORENSIC_SCIENTIST, Role.MURDERER];
        if (roomSettings.includeAccomplice && gameState.players.length >= 5) roles.push(Role.ACCOMPLICE);
        if (roomSettings.includeWitness && gameState.players.length >= 6) roles.push(Role.WITNESS);
        
        while (roles.length < gameState.players.length) {
          roles.push(Role.INVESTIGATOR);
        }

        const shuffledRoles = roles.sort(() => 0.5 - Math.random());
        
        // Ensure sufficient cards
        let meansDeck = [...MEANS_CARDS];
        let evidenceDeck = [...EVIDENCE_CARDS];
        
        // Multiply decks to prevent running out if highly populated
        const totalCardsNeeded = gameState.players.length * 4;
        while (meansDeck.length < totalCardsNeeded) {
            meansDeck = [...meansDeck, ...MEANS_CARDS.map(c => ({...c, id: c.id + "_" + Math.random().toString().substring(2,5)}))];
        }
        while (evidenceDeck.length < totalCardsNeeded) {
            evidenceDeck = [...evidenceDeck, ...EVIDENCE_CARDS.map(c => ({...c, id: c.id + "_" + Math.random().toString().substring(2,5)}))];
        }

        meansDeck.sort(() => 0.5 - Math.random());
        evidenceDeck.sort(() => 0.5 - Math.random());

        const updatedPlayers = gameState.players.map((p, idx) => {
          const role = shuffledRoles[idx];
          const cards: Card[] = [];
          if (role !== Role.FORENSIC_SCIENTIST) {
            for (let i = 0; i < 4; i++) {
                const card = meansDeck.pop();
                if (card) cards.push(card);
            }
            for (let i = 0; i < 4; i++) {
                 const card = evidenceDeck.pop();
                 if (card) cards.push(card);
            }
          }
          return { ...p, role, cards, hasBadge: true }; // Explicitly reset badge to true
        });

        const scientist = updatedPlayers.find(p => p.role === Role.FORENSIC_SCIENTIST);
        const murderer = updatedPlayers.find(p => p.role === Role.MURDERER);
        const accomplice = updatedPlayers.find(p => p.role === Role.ACCOMPLICE);
        const witness = updatedPlayers.find(p => p.role === Role.WITNESS);

        if (!scientist || !murderer) {
            console.error("Failed to assign essential roles");
            setIsProcessing(false);
            return;
        }

        // --- Setup Board Tiles ---
        const randomLocation = LOCATION_TILES[Math.floor(Math.random() * LOCATION_TILES.length)];
        const shuffledOthers = [...SCENE_TILES].sort(() => 0.5 - Math.random());
        const initialOthers = shuffledOthers.splice(0, 4);
        const initialTiles = [randomLocation, ...initialOthers];

        const myPlayer = updatedPlayers.find(p => p.id === gameState.activePlayerId);
        if (myPlayer) {
          setUserRoleView(myPlayer.role);
        }

        setGameState(prev => ({
          ...prev,
          phase: GamePhase.ROLE_REVEAL,
          players: updatedPlayers,
          forensicScientistId: scientist!.id,
          murdererId: murderer!.id,
          accompliceId: accomplice?.id,
          witnessId: witness?.id,
          sceneTiles: initialTiles,
          causeOfDeathTile: { ...CAUSE_OF_DEATH_TILE }, 
          availableSceneTiles: shuffledOthers, 
          currentRound: 1,
          winner: null,
          solution: null,
          aiNarrative: undefined,
          chatMessages: [
            ...prev.chatMessages, 
            {
              id: 'sys-start',
              senderId: 'sys',
              senderName: 'System',
              text: prev.language === 'vi' ? 'Trò chơi bắt đầu. Xem vai trò của bạn.' : 'Game Started. Check your identity.',
              timestamp: Date.now(),
              isSystem: true
            }
          ]
        }));
        setIsProcessing(false);
    }, 1500); // Wait 1.5s to simulate server processing
  };

  // --- Logic: Phase Transitions ---

  const nextPhase = () => {
    setIsProcessing(true);
    setTimeout(() => {
        if (gameState.phase === GamePhase.ROLE_REVEAL) {
          setGameState(prev => ({ ...prev, phase: GamePhase.NIGHT_PHASE }));
          
          const me = gameState.players.find(p => p.id === gameState.activePlayerId);
          if (me?.role === Role.MURDERER) {
             setUserRoleView(Role.MURDERER);
          } else if (me?.role === Role.FORENSIC_SCIENTIST) {
             setUserRoleView(Role.FORENSIC_SCIENTIST);
          }
          
        } else if (gameState.phase === GamePhase.NIGHT_PHASE) {
          if (!gameState.solution) {
            alert(t.murdererInstruction);
            setIsProcessing(false);
            return;
          }
          
          setGameState(prev => ({ ...prev, phase: GamePhase.INVESTIGATION }));
          setTimeLeft(roomSettings.roundTimeSeconds); 
          
          const me = gameState.players.find(p => p.id === gameState.activePlayerId);
          if (me) setUserRoleView(me.role);
          
        } else if (gameState.phase === GamePhase.INVESTIGATION) {
          if (gameState.activePlayerId === gameState.forensicScientistId) {
            if (gameState.causeOfDeathTile.selectedOptionIndex === null) {
              alert(gameState.language === 'vi' ? "Pháp Y phải đặt viên đạn vào 'Nguyên Nhân Tử Vong'!" : "Forensic Scientist must place a bullet on 'Cause of Death'!");
              setIsProcessing(false);
              return;
            }
            const missingTiles = gameState.sceneTiles.filter(t => t.selectedOptionIndex === null);
            if (missingTiles.length > 0) {
              alert(gameState.language === 'vi' ? "Vui lòng đặt gợi ý cho tất cả các Thẻ Hiện Trường!" : "Please place bullets on ALL Scene Tiles before ending the round!");
              setIsProcessing(false);
              return;
            }
          }
          setGameState(prev => ({ ...prev, phase: GamePhase.POST_ROUND_VOTING }));
          setTimeLeft(30);

        } else if (gameState.phase === GamePhase.POST_ROUND_VOTING) {
           if (gameState.currentRound < 3) {
            setGameState(prev => ({ 
              ...prev, 
              phase: GamePhase.REPLACE_TILE,
              chatMessages: [...prev.chatMessages, {
                id: `sys-r${prev.currentRound}-end`,
                senderId: 'sys',
                senderName: 'System',
                text: prev.language === 'vi' ? `Kết thúc Vòng ${prev.currentRound}. Pháp Y hãy thay thế 1 thẻ.` : `Round ${prev.currentRound} ended. Scientist must replace a tile.`,
                timestamp: Date.now(),
                isSystem: true
              }]
            }));
            setTimeLeft(0); 
          } else {
            setGameState(prev => ({ 
              ...prev, 
              phase: GamePhase.GAME_OVER, 
              winner: 'MURDERER',
              winReason: t.reasonWrong
            }));
          }
        }
        setIsProcessing(false);
    }, 500);
  };

  // --- Logic: Game Actions ---

  const handleMurdererSelection = (card: Card) => {
    if (gameState.phase !== GamePhase.NIGHT_PHASE) return;
    
    setNightSelection(prev => {
      if (card.type === CardType.MEANS) return { ...prev, means: card.id };
      return { ...prev, evidence: card.id };
    });
  };

  const confirmMurder = async () => {
    if (!nightSelection.means || !nightSelection.evidence) return;

    const findCardOwner = (cardId: string) => 
      gameState.players.find(p => p.cards.some(c => c.id === cardId));

    const meansOwner = findCardOwner(nightSelection.means);
    const evidenceOwner = findCardOwner(nightSelection.evidence);

    if (!meansOwner || !evidenceOwner || meansOwner.id !== evidenceOwner.id) {
      alert(t.errorSameSet);
      return;
    }
    
    const selectedMeansCard = meansOwner.cards.find(c => c.id === nightSelection.means);
    const selectedEvidenceCard = evidenceOwner.cards.find(c => c.id === nightSelection.evidence);

    setGameState(prev => ({
      ...prev,
      solution: {
        murdererId: meansOwner.id, 
        meansId: nightSelection.means!,
        evidenceId: nightSelection.evidence!
      },
      isGeneratingNarrative: true 
    }));

    if (selectedMeansCard && selectedEvidenceCard) {
      try {
        const narrative = await generateCrimeSceneNarrative(selectedMeansCard, selectedEvidenceCard, gameState.language);
        setGameState(prev => ({
          ...prev,
          aiNarrative: narrative,
          isGeneratingNarrative: false
        }));
      } catch (e) {
        console.error("AI Generation failed", e);
        setGameState(prev => ({ ...prev, isGeneratingNarrative: false }));
      }
    }
    
    setGameState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, {
        id: `sys-murder`,
        senderId: 'sys',
        senderName: 'System',
        text: prev.language === 'vi' ? 'Một án mạng đã xảy ra trong đêm.' : 'A murder was committed in the silence of the night.',
        timestamp: Date.now(),
        isSystem: true
      }]
    }));
    
    setTimeout(() => nextPhase(), 1000);
  };

  const handleBulletPlacement = async (tileId: string, optionIndex: number) => {
    if (gameState.phase !== GamePhase.INVESTIGATION) return;
    
    const tileName = gameState.sceneTiles.find(t => t.id === tileId)?.name || (tileId === 'cause_of_death' ? t.causeOfDeath : 'Unknown');
    const options = gameState.sceneTiles.find(t => t.id === tileId)?.options || (tileId === 'cause_of_death' ? CAUSE_OF_DEATH_TILE.options : []);
    const optionText = options[optionIndex];

    const updateTile = (tile: SceneTileData) => 
      tile.id === tileId ? { ...tile, selectedOptionIndex: optionIndex } : tile;

    setGameState(prev => ({
      ...prev,
      causeOfDeathTile: tileId === 'cause_of_death' ? { ...prev.causeOfDeathTile, selectedOptionIndex: optionIndex } : prev.causeOfDeathTile,
      sceneTiles: prev.sceneTiles.map(updateTile),
      chatMessages: [...prev.chatMessages, {
        id: `sys-hint-${Date.now()}`,
        senderId: 'sys',
        senderName: 'Forensic Scientist',
        text: prev.language === 'vi' ? `Gợi ý: ${tileName} -> ${optionText}` : `Clue: ${tileName} -> ${optionText}`,
        timestamp: Date.now(),
        isSystem: true
      }]
    }));
  };

  const checkClueWithAI = async (tileId: string) => {
    if (!gameState.solution) return;
    
    const tile = tileId === 'cause_of_death' ? gameState.causeOfDeathTile : gameState.sceneTiles.find(t => t.id === tileId);
    if (!tile || tile.selectedOptionIndex === null) return;
    
    const meansOwner = gameState.players.find(p => p.id === gameState.solution?.murdererId);
    const mCard = meansOwner?.cards.find(c => c.id === gameState.solution?.meansId);
    const eCard = meansOwner?.cards.find(c => c.id === gameState.solution?.evidenceId);

    if (mCard && eCard) {
      const feedback = await evaluateClueQuality(
         mCard, 
         eCard, 
         tile.name, 
         tile.options[tile.selectedOptionIndex], 
         gameState.language
      );
      alert(`AI Referee: ${feedback}`);
    }
  };

  const handleReplaceTile = (oldTileId: string) => {
    if (gameState.availableSceneTiles.length === 0) return;

    const newTile = gameState.availableSceneTiles[0];
    const remainingDeck = gameState.availableSceneTiles.slice(1);
    
    setGameState(prev => ({
      ...prev,
      sceneTiles: prev.sceneTiles.map(t => t.id === oldTileId ? { ...newTile, isNew: true } : { ...t, isNew: false }),
      availableSceneTiles: remainingDeck,
      phase: GamePhase.INVESTIGATION, 
      currentRound: prev.currentRound + 1,
      chatMessages: [...prev.chatMessages, {
        id: `sys-replace-${Date.now()}`,
        senderId: 'sys',
        senderName: 'System',
        text: prev.language === 'vi' 
           ? `Vòng ${prev.currentRound + 1}: Một thẻ hiện trường đã được thay mới.` 
           : `Round ${prev.currentRound + 1}: A Scene Tile has been replaced.`,
        timestamp: Date.now(),
        isSystem: true
      }]
    }));
    setTimeLeft(roomSettings.roundTimeSeconds);
  };

  const submitAccusation = () => {
    const { suspectId, means, evidence } = accusationSelection;
    if (!gameState.solution || !suspectId || !means || !evidence) return;

    const accuser = gameState.players.find(p => p.id === gameState.activePlayerId);
    
    // Guard: Must have badge
    if (!accuser || !accuser.hasBadge) {
      alert(gameState.language === 'vi' ? "Bạn không còn huy hiệu!" : "You have lost your badge!");
      setShowAccusationModal(false);
      return;
    }
    
    const isCorrect = 
      suspectId === gameState.solution.murdererId &&
      means === gameState.solution.meansId &&
      evidence === gameState.solution.evidenceId;

    if (isCorrect) {
      setGameState(prev => ({ ...prev, phase: GamePhase.GAME_OVER, winner: 'POLICE', winReason: t.reasonCorrect }));
      setShowAccusationModal(false); // Close modal
    } else {
      setGameState(prev => {
        const updatedPlayers = prev.players.map(p => 
          p.id === accuser.id ? { ...p, hasBadge: false } : p
        );
        
        const failMsg = prev.language === 'vi' 
           ? `${accuser.name} đoán sai! Huy hiệu bị vỡ nát.` 
           : `${accuser.name} accused incorrectly! Their badge is shattered.`;

        const anyBadgesLeft = updatedPlayers.some(p => p.role !== Role.FORENSIC_SCIENTIST && p.hasBadge);
        
        if (!anyBadgesLeft) {
          return { ...prev, players: updatedPlayers, phase: GamePhase.GAME_OVER, winner: 'MURDERER', winReason: t.reasonEscape };
        }
        
        return { 
          ...prev, 
          players: updatedPlayers,
          chatMessages: [...prev.chatMessages, {
            id: `sys-accuse-${Date.now()}`,
            senderId: 'sys',
            senderName: 'System',
            text: failMsg,
            timestamp: Date.now(),
            isSystem: true
          }]
        };
      });
      
      alert(t.badgeLost);
      setShowAccusationModal(false);
    }
  };
  
  const handleVotePass = () => {
    // Player chooses to pass this voting phase
    // In this simulation, this skips the wait by setting timer to 0
    setTimeLeft(0);
  };

  const sendChatMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    
    const sender = gameState.players.find(p => p.id === gameState.activePlayerId); 
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: sender?.id || 'sys',
      senderName: sender?.name || 'System',
      text: chatInput,
      timestamp: Date.now()
    };
    
    setGameState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, newMessage]
    }));
    setChatInput('');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Render Helpers ---

  const toggleLanguage = () => {
    setGameState(prev => ({ ...prev, language: prev.language === 'vi' ? 'en' : 'vi' }));
  };

  const RoleIcon = ({ role, className }: { role: Role, className?: string }) => {
    const Icon = () => {
      switch (role) {
        case Role.FORENSIC_SCIENTIST: return <FlaskConical className={clsx("text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]", className)} size={18} />;
        case Role.MURDERER: return <Skull className={clsx("text-blood drop-shadow-[0_0_5px_rgba(136,19,55,0.8)]", className)} size={18} />;
        case Role.ACCOMPLICE: return <Ghost className={clsx("text-purple-500 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]", className)} size={18} />;
        case Role.WITNESS: return <Eye className={clsx("text-spirit drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]", className)} size={18} />;
        case Role.INVESTIGATOR: default: return <Search className={clsx("text-slate-400", className)} size={18} />;
      }
    };
    return <span title={role}><Icon /></span>
  };

  const isScientistView = userRoleView === Role.FORENSIC_SCIENTIST;
  const isMurdererView = userRoleView === Role.MURDERER;
  const isAccompliceView = userRoleView === Role.ACCOMPLICE;
  const isWitnessView = userRoleView === Role.WITNESS;

  const mainBackground = "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mystic-800 via-mystic-950 to-black";
  const nightBackground = "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blood/30 via-mystic-950 to-black animate-pulse-slow";

  // --- LOBBY VIEW ---
  if (gameState.phase === GamePhase.LOBBY) {
    if (!gameState.roomCode && !isJoinMode) {
      return (
        <div className={clsx("min-h-screen flex flex-col items-center justify-center p-6 text-slate-200 relative overflow-hidden", mainBackground)}>
           {/* Decor Elements */}
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
           <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-mystic-900 to-transparent"></div>
           
           <div className="absolute top-4 right-4 z-50 flex gap-4">
              <button onClick={() => setShowGuideModal(true)} className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors font-serif">
                 <BookOpen size={16} /> {t.gameGuide}
              </button>
             <button onClick={toggleLanguage} className="flex items-center gap-2 text-slate-400 hover:text-spirit transition-colors font-serif">
               <Globe size={16} /> {gameState.language.toUpperCase()}
             </button>
           </div>
           
           <GuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} language={gameState.language} />

           <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center space-y-8 max-w-md w-full relative z-10">
             <div className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 tracking-tighter drop-shadow-2xl text-glow">{t.appTitle}</h1>
                <h2 className="text-lg md:text-xl tracking-[0.4em] text-blood font-serif uppercase drop-shadow-lg">{t.appSubtitle}</h2>
             </div>
             
             <div className="glass-panel p-6 rounded-xl border border-white/5 w-full mt-8 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-spirit text-xs uppercase tracking-widest font-bold text-left font-serif">
                    {gameState.language === 'vi' ? 'Định Danh' : 'Identity'}
                  </label>
                  <div className="flex items-center gap-3 bg-mystic-950/50 p-3 rounded-lg border border-white/10 focus-within:border-spirit/50 transition-colors">
                      <User size={20} className="text-spirit" />
                      <input 
                        type="text" 
                        value={localPlayerName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="bg-transparent border-none text-white focus:outline-none w-full font-serif font-bold text-lg"
                        placeholder="Enter your name"
                        maxLength={15}
                      />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-spirit text-xs uppercase tracking-widest font-bold text-left flex items-center gap-2 font-serif">
                    <Palette size={14} /> {gameState.language === 'vi' ? 'Hào quang' : 'Aura Color'}
                  </label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {AVATAR_COLORS.map(color => (
                      <button 
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={clsx(
                          "w-8 h-8 rounded-full border-2 transition-all shadow-lg",
                          color.split(' ')[0], // bg class
                          localAvatarColor === color ? "border-white ring-2 ring-spirit scale-110" : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      />
                    ))}
                  </div>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4 w-full pt-4">
               <button onClick={createLobby} disabled={isProcessing} className="group relative bg-blood/20 hover:bg-blood/40 border border-blood/50 p-4 rounded text-xl font-serif font-bold transition-all overflow-hidden disabled:opacity-50">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blood/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                 <span className="text-red-100 drop-shadow-md flex items-center justify-center gap-2">
                    {isProcessing ? <RefreshCcw className="animate-spin" /> : <Radio />}
                    {t.createRoom}
                 </span>
               </button>
               <button onClick={() => setIsJoinMode(true)} className="bg-mystic-800/50 hover:bg-mystic-800 border border-mystic-600 p-4 rounded text-xl font-serif font-bold transition-all text-slate-300 hover:text-white hover:border-spirit/50 flex items-center justify-center gap-2">
                 <Wifi /> {t.joinRoom}
               </button>
             </div>
           </motion.div>
        </div>
      );
    }
    
    if (isJoinMode) {
      return (
        <div className={clsx("min-h-screen flex flex-col items-center justify-center p-6", mainBackground)}>
           <div className="glass-panel p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl">
              <h2 className="text-3xl text-white font-serif font-bold mb-4 text-center border-b border-white/10 pb-4">{t.joinRoom}</h2>
              <div className="mb-6 bg-black/20 p-4 rounded-lg border border-white/5 flex items-center gap-4">
                <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-white shadow-lg border border-white/20", localAvatarColor.split(' ')[0])}>
                  {localPlayerName.charAt(0)}
                </div>
                <div>
                   <label className="text-slate-500 text-xs uppercase block font-serif tracking-widest">
                    {gameState.language === 'vi' ? 'Tham gia với tên' : 'Joining as'}
                   </label>
                   <div className="text-spirit font-bold text-lg">{localPlayerName}</div>
                </div>
              </div>
              
              <div className="relative">
                <input 
                  type="text" 
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="A1B2C3" 
                  className="w-full bg-mystic-950/80 border border-mystic-700 p-4 rounded text-white uppercase tracking-[0.5em] text-center text-2xl font-serif focus:border-spirit focus:outline-none focus:ring-1 focus:ring-spirit" 
                />
                <span className="absolute -bottom-6 left-0 right-0 text-center text-xs text-slate-500">
                  {gameState.language === 'vi' ? 'Nhập mã phòng gồm 6 ký tự' : 'Enter 6-character room code'}
                </span>
              </div>

              <div className="flex gap-4 pt-6">
                 <button onClick={() => setIsJoinMode(false)} className="flex-1 bg-transparent border border-slate-600 hover:bg-slate-800 p-3 rounded text-slate-300 font-serif">{t.cancel}</button>
                 <button onClick={handleJoinRoom} disabled={isProcessing} className="flex-1 bg-spirit/20 border border-spirit/50 hover:bg-spirit/30 p-3 rounded text-spirit font-bold font-serif shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2">
                    {isProcessing ? <RefreshCcw className="animate-spin"/> : "CONNECT"}
                 </button>
              </div>
           </div>
        </div>
      )
    }

    const amIHost = gameState.players.find(p => p.id === gameState.activePlayerId)?.isHost;

    return (
      <div className={clsx("min-h-screen text-slate-200 p-6 flex flex-col items-center", mainBackground)}>
         <GuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} language={gameState.language} />
         
         {/* Top Bar Lobby */}
         <div className="w-full max-w-5xl flex justify-between mb-4">
             <div className="flex items-center gap-2 px-3 py-1 rounded bg-black/40 border border-white/10 text-slate-400 text-xs font-mono">
               <Server size={14} className={isProcessing ? "animate-pulse text-yellow-500" : "text-green-500"} /> 
               {amIHost ? "MCP: ONLINE" : "CONNECTED TO MAIN FRAME"}
             </div>
             <button onClick={() => setShowGuideModal(true)} className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors font-serif bg-black/40 px-3 py-1 rounded-full border border-white/10">
                 <BookOpen size={16} /> {t.gameGuide}
              </button>
         </div>

         <div className="w-full max-w-5xl space-y-8 relative z-10">
           <div className="glass-panel p-6 rounded-xl flex flex-col md:flex-row justify-between items-end border border-white/5">
             <div>
               <h2 className="text-3xl font-serif font-bold text-amber-500 drop-shadow-md">{t.startTitle}</h2>
               <div className="flex items-center gap-3 mt-2">
                 <span className="text-slate-500 font-serif">{t.roomCode}:</span>
                 <div className="flex gap-1 group cursor-pointer" onClick={() => {navigator.clipboard.writeText(gameState.roomCode); alert("Copied Code!");}}>
                    {gameState.roomCode.split('').map((char, i) => (
                      <span key={i} className="w-8 h-10 flex items-center justify-center bg-mystic-950/80 border border-mystic-700 rounded font-mono text-xl text-spirit font-bold shadow-inner group-hover:border-spirit transition-colors">
                        {char}
                      </span>
                    ))}
                 </div>
               </div>
             </div>
             <div className="flex flex-col items-end gap-3 mt-4 md:mt-0">
               <span className="text-xs uppercase tracking-widest text-slate-500">{gameState.players.length} / {roomSettings.maxPlayers} Agents</span>
             </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {gameState.players.map(p => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      key={p.id} 
                      className="glass-panel p-4 rounded-lg flex items-center gap-3 border border-white/5 hover:border-spirit/30 transition-colors group relative"
                    >
                      <div className="relative">
                        <div className={clsx(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg border font-serif",
                          p.avatarColor || "bg-slate-800"
                        )}>
                          {p.name[0]}
                        </div>
                        {p.isSpeaking && !isDeafened && <span className="absolute inset-0 rounded-full border-2 border-spirit animate-ping opacity-75"></span>}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-slate-200 truncate">{p.name}</span>
                            {p.isHost && <span className="text-[10px] bg-amber-900/50 border border-amber-600 px-1 rounded text-amber-500 font-bold">HOST</span>}
                            {p.id === gameState.activePlayerId && <span className="text-[10px] bg-slate-700 px-1 rounded text-slate-300">YOU</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 h-4">
                          {p.isSpeaking && !isDeafened ? <span className="text-spirit flex items-center gap-1 animate-pulse"><Volume2 size={10} /> Speaking</span> : <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={10} /> Ready</span>}
                        </div>
                      </div>

                      {amIHost && !p.isHost && (
                        <button
                          onClick={() => handleKickPlayer(p.id)}
                          className="absolute -top-2 -right-2 bg-red-900/80 border border-red-500 text-red-200 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 hover:scale-110 z-20"
                          title={t.kick}
                        >
                           <UserMinus size={14} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* Empty Slots */}
                  {Array.from({ length: Math.max(0, roomSettings.maxPlayers - gameState.players.length) }).map((_, i) => (
                      <div key={i} className="border border-dashed border-white/10 rounded-lg p-4 flex flex-col items-center justify-center text-slate-700 font-serif text-sm h-[82px] animate-pulse">
                         <span>{t.waitingForPlayers}</span>
                      </div>
                  ))}
                </div>

                {/* Add Player Control for Host */}
                {amIHost && gameState.players.length < roomSettings.maxPlayers && (
                    <div className="flex justify-center">
                        <button 
                          onClick={simulatePlayerJoin} 
                          disabled={isProcessing}
                          className="text-xs text-slate-500 hover:text-spirit flex items-center gap-2 border border-dashed border-slate-700 px-4 py-2 rounded hover:border-spirit transition-colors"
                        >
                           {isProcessing ? <RefreshCcw size={14} className="animate-spin"/> : <UserPlus size={14} />}
                           {t.addPlayer}
                        </button>
                    </div>
                )}

                <div className="glass-panel rounded-xl h-64 flex flex-col border border-white/5">
                    <div className="p-3 border-b border-white/5 text-xs text-spirit font-bold uppercase tracking-widest font-serif">{t.chat}</div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {gameState.chatMessages.map(msg => (
                        <div key={msg.id} className="text-sm">
                          <span className="font-bold text-slate-400 font-serif">{msg.senderName}: </span>
                          <span className="text-slate-300">{msg.text}</span>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={sendChatMessage} className="p-3 flex gap-2 bg-black/20">
                      <input 
                        className="flex-1 bg-mystic-950/50 border border-mystic-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-spirit text-white" 
                        placeholder={t.typeMessage}
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                      />
                      <button type="submit" className="bg-mystic-700 px-4 rounded hover:bg-mystic-600 text-spirit"><SendIcon /></button>
                    </form>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-panel p-5 rounded-xl space-y-6 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-spirit/50 to-transparent"></div>
                  <h3 className="font-serif font-bold text-amber-500 flex items-center gap-2 uppercase tracking-widest text-sm">
                    <Settings size={16} /> {t.settingsTitle}
                  </h3>
                  
                  {amIHost ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs uppercase text-slate-500 font-bold tracking-wider font-serif flex justify-between">
                          {t.maxPlayers}
                        </label>
                        <div className="flex items-center justify-between bg-black/20 p-2 rounded border border-white/5">
                            <span className="font-serif text-xl text-white ml-2">{roomSettings.maxPlayers}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setRoomSettings(p => ({...p, maxPlayers: Math.max(4, p.maxPlayers - 1)}))} className="w-8 h-8 hover:bg-white/10 rounded flex items-center justify-center text-slate-400 border border-white/10 font-bold">-</button>
                                <button onClick={() => setRoomSettings(p => ({...p, maxPlayers: Math.min(12, p.maxPlayers + 1)}))} className="w-8 h-8 hover:bg-white/10 rounded flex items-center justify-center text-slate-400 border border-white/10 font-bold">+</button>
                            </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                         <label className="text-xs uppercase text-slate-500 font-bold tracking-wider font-serif">{t.rolesConfig}</label>
                         
                         <label className={clsx(
                           "flex items-center justify-between p-3 rounded border transition-all cursor-pointer",
                           roomSettings.includeAccomplice ? "bg-purple-900/20 border-purple-500/50" : "bg-black/20 border-white/5 hover:border-white/20"
                         )}>
                            <div className="flex items-center gap-2">
                               <Ghost size={16} className={roomSettings.includeAccomplice ? "text-purple-400" : "text-slate-600"} />
                               <span className={clsx("font-serif text-sm", roomSettings.includeAccomplice ? "text-purple-200" : "text-slate-400")}>{t.roleAccomplice}</span>
                            </div>
                            <div className="relative">
                               <input type="checkbox" className="hidden" checked={roomSettings.includeAccomplice} onChange={() => setRoomSettings(p => ({...p, includeAccomplice: !p.includeAccomplice}))} />
                               <div className={clsx("w-10 h-5 rounded-full transition-colors", roomSettings.includeAccomplice ? "bg-purple-600" : "bg-slate-700")}></div>
                               <div className={clsx("absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform", roomSettings.includeAccomplice && "translate-x-5")}></div>
                            </div>
                         </label>

                         <label className={clsx(
                           "flex items-center justify-between p-3 rounded border transition-all cursor-pointer",
                           roomSettings.includeWitness ? "bg-sky-900/20 border-sky-500/50" : "bg-black/20 border-white/5 hover:border-white/20"
                         )}>
                            <div className="flex items-center gap-2">
                               <Eye size={16} className={roomSettings.includeWitness ? "text-sky-400" : "text-slate-600"} />
                               <span className={clsx("font-serif text-sm", roomSettings.includeWitness ? "text-sky-200" : "text-slate-400")}>{t.roleWitness}</span>
                            </div>
                            <div className="relative">
                               <input type="checkbox" className="hidden" checked={roomSettings.includeWitness} onChange={() => setRoomSettings(p => ({...p, includeWitness: !p.includeWitness}))} />
                               <div className={clsx("w-10 h-5 rounded-full transition-colors", roomSettings.includeWitness ? "bg-sky-600" : "bg-slate-700")}></div>
                               <div className={clsx("absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform", roomSettings.includeWitness && "translate-x-5")}></div>
                            </div>
                         </label>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs uppercase text-slate-500 font-bold tracking-wider font-serif">
                           <span>{t.roundTime}</span>
                           <span className="text-spirit">{roomSettings.roundTimeSeconds} {t.seconds}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-black/20 p-2 rounded border border-white/5">
                           <Clock size={16} className="text-slate-500" />
                           <input 
                             type="range" 
                             min="60" max="600" step="30" 
                             value={roomSettings.roundTimeSeconds}
                             onChange={(e) => setRoomSettings(p => ({...p, roundTimeSeconds: parseInt(e.target.value)}))}
                             className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-spirit"
                           />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-slate-500 italic text-sm">
                      Only the MCP (Host) can configure the simulation settings.
                    </div>
                  )}
                </div>
              </div>
           </div>

           <div className="flex justify-center gap-4">
             <button 
               onClick={toggleMic}
               className={clsx(
                 "flex items-center gap-2 px-6 py-3 rounded-full border transition-all font-serif tracking-wide shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                 isMicOn ? "bg-green-900/80 border-green-500 text-green-100" : "glass-panel border-white/10 text-slate-400 hover:text-white"
               )}
             >
               {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
               {isMicOn ? "Voice Uplink" : "Voice Muted"}
             </button>
           </div>

           {amIHost ? (
             <button onClick={startGame} disabled={isProcessing || gameState.players.length < 4} className="w-full bg-blood/80 hover:bg-blood border border-blood text-red-100 p-5 rounded-xl font-serif font-bold text-2xl transition-all shadow-[0_0_20px_rgba(136,19,55,0.4)] tracking-widest uppercase disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3">
               {isProcessing ? <RefreshCcw className="animate-spin" /> : <Play />}
               {t.startGame}
             </button>
           ) : (
             <div className="w-full bg-slate-800/50 border border-slate-700 text-slate-400 p-5 rounded-xl font-serif font-bold text-xl text-center tracking-widest uppercase animate-pulse flex items-center justify-center gap-3">
               <Radio className="animate-ping" size={16} />
               {t.waitingForHost}
             </div>
           )}
         </div>
      </div>
    );
  }

  // --- GAME VIEW ---
  return (
    <div className={clsx("min-h-screen text-slate-200 flex flex-col overflow-hidden font-sans transition-all duration-1000", 
       gameState.phase === GamePhase.NIGHT_PHASE ? nightBackground : mainBackground
    )}>
      {/* Game Guide Modal in Game View (Optional, but good UX) */}
      <GuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} language={gameState.language} />
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {isProcessing && (
           <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                 <RefreshCcw className="w-12 h-12 text-spirit animate-spin" />
                 <span className="text-spirit font-serif tracking-widest uppercase">Processing Server Request...</span>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      <header className="h-16 border-b border-white/5 bg-mystic-950/80 backdrop-blur-md flex items-center justify-between px-4 z-20 shadow-lg">
        <div className="flex items-center gap-4">
          <span className="font-serif font-bold text-rose-700 text-xl hidden md:block tracking-widest drop-shadow-sm">{t.appTitle}</span>
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
             <div className={clsx("w-2 h-2 rounded-full animate-pulse", gameState.phase === GamePhase.NIGHT_PHASE ? "bg-blood shadow-[0_0_8px_red]" : "bg-amber-500 shadow-[0_0_8px_orange]")}></div>
             <span className="text-xs font-serif font-bold tracking-wider text-slate-300 uppercase">
                {gameState.phase === GamePhase.NIGHT_PHASE ? t.nightPhase : 
                 gameState.phase === GamePhase.INVESTIGATION ? `${t.investigationPhase}` :
                 gameState.phase === GamePhase.POST_ROUND_VOTING ? t.votingPhase :
                 gameState.phase === GamePhase.REPLACE_TILE ? t.replaceTileTitle :
                 t.appTitle}
             </span>
          </div>

          {/* Round Indicator */}
          {[GamePhase.INVESTIGATION, GamePhase.POST_ROUND_VOTING, GamePhase.REPLACE_TILE].includes(gameState.phase) && (
            <div className="flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full border border-white/10 ml-2">
              <Hourglass size={14} className="text-spirit" />
              <span className="text-xs font-serif font-bold text-slate-300">
                {t.roundInfo} {gameState.currentRound}/3
              </span>
            </div>
          )}

          {/* Timer Display */}
          {[GamePhase.INVESTIGATION, GamePhase.POST_ROUND_VOTING].includes(gameState.phase) && (
            <div className={clsx(
              "flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ml-2 font-mono font-bold",
              gameState.phase === GamePhase.POST_ROUND_VOTING || timeLeft < 30 
                ? "bg-red-900/50 border-red-500 text-red-200 animate-pulse" 
                : "bg-black/40 border-white/10 text-emerald-400"
            )}>
              <Timer size={14} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 glass-panel p-1.5 rounded-full border border-white/10">
           <button 
             onClick={toggleMic}
             className={clsx(
               "p-2 rounded-full transition-all",
               isMicOn ? "bg-green-900/80 text-green-100 shadow-[0_0_10px_rgba(22,163,74,0.3)]" : "bg-transparent text-slate-500 hover:text-white"
             )}
           >
             {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
           </button>
           <button 
              onClick={() => setIsDeafened(!isDeafened)}
              className={clsx(
                "p-2 rounded-full transition-all",
                isDeafened ? "bg-blood text-white shadow-lg" : "bg-transparent text-slate-500 hover:text-white"
              )}
           >
              {isDeafened ? <VolumeX size={18} /> : <Volume2 size={18} />}
           </button>
        </div>

        {/* Debug Role Switcher - Hidden in production usually */}
        <div className="hidden lg:flex bg-black/50 rounded overflow-hidden text-xs border border-white/5 font-serif">
           {[Role.FORENSIC_SCIENTIST, Role.MURDERER, Role.INVESTIGATOR, Role.ACCOMPLICE, Role.WITNESS].map(r => (
             <button key={r} onClick={() => setUserRoleView(r)} className={clsx("px-3 py-1 hover:bg-white/5", userRoleView === r && "bg-mystic-700 text-white")}>
               {r.substring(0, 4)}
             </button>
           ))}
        </div>

        <div className="flex items-center gap-3">
           {/* In-game Guide Trigger */}
           <button onClick={() => setShowGuideModal(true)} className="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-amber-500">
              <BookOpen size={20} />
           </button>
           <button onClick={() => setShowChat(!showChat)} className="p-2 rounded hover:bg-white/10 relative text-slate-400 hover:text-spirit">
              <MessageSquare size={20} />
              {gameState.chatMessages.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-spirit rounded-full animate-pulse"></span>}
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative flex">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
          
          {/* ROLE REVEAL */}
          {gameState.phase === GamePhase.ROLE_REVEAL && (
            <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-1000">
               <div className="text-center space-y-4">
                 <div className="text-slate-500 uppercase tracking-[0.3em] text-xs font-serif">{t.youAre}</div>
                 <div className={clsx(
                   "text-5xl md:text-7xl font-serif font-black drop-shadow-[0_0_15px_rgba(0,0,0,1)]",
                   isScientistView ? "text-amber-500" : 
                   isMurdererView ? "text-blood" : 
                   isAccompliceView ? "text-purple-500" : 
                   isWitnessView ? "text-emerald-500" :
                   "text-sky-500"
                 )}>
                   {isScientistView ? t.roleScientist : 
                    isMurdererView ? t.roleMurderer : 
                    isAccompliceView ? t.roleAccomplice : 
                    isWitnessView ? t.roleWitness :
                    t.roleInvestigator}
                 </div>
                 <p className="max-w-md text-slate-300 mx-auto font-sans italic border-t border-white/10 pt-4">
                   "{isScientistView ? t.descScientist : 
                     isMurdererView ? t.descMurderer : 
                     isAccompliceView ? t.descAccomplice : 
                     isWitnessView ? t.descWitness :
                     t.descInvestigator}"
                 </p>

                 {(isAccompliceView || isWitnessView) && (
                   <div className="mt-6 p-4 bg-black/40 border border-white/10 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase mb-2 font-bold">Information Known</p>
                      <div className="text-white font-serif">
                        {isAccompliceView && `Murderer is: ${gameState.players.find(p => p.id === gameState.murdererId)?.name}`}
                        {isWitnessView && `Suspects: ${gameState.players.filter(p => p.id === gameState.murdererId || p.id === gameState.accompliceId).map(p => p.name).join(' & ')}`}
                      </div>
                   </div>
                 )}

               </div>
               <button onClick={nextPhase} className="bg-white/5 hover:bg-white/10 border border-white/20 px-10 py-3 rounded-full text-lg font-serif tracking-widest transition-all hover:scale-105 hover:border-spirit/50">
                 ACCEPT FATE
               </button>
            </div>
          )}

          {/* NIGHT PHASE */}
          {gameState.phase === GamePhase.NIGHT_PHASE && (
            <div className={clsx("min-h-full flex flex-col items-center")}>
              {isMurdererView ? (
                 <div className="space-y-8 max-w-5xl mx-auto w-full">
                    <div className="text-center space-y-2 pt-10">
                       <h2 className="text-4xl font-serif text-blood drop-shadow-lg tracking-widest">{t.murdererTurn}</h2>
                       <p className="text-slate-400 font-sans italic">{t.murdererInstruction}</p>
                    </div>
                    
                    {/* Murderer Cards */}
                    {gameState.players.find(p => p.role === Role.MURDERER) && (
                      <div className="space-y-4">
                        <div className="text-center text-blood/80 font-serif font-bold uppercase tracking-widest text-sm border-b border-blood/20 pb-2 w-fit mx-auto">
                          {t.yourCards}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-black/60 rounded-xl border border-blood/30 backdrop-blur-sm">
                          {gameState.players.find(p => p.role === Role.MURDERER)!.cards.map(card => (
                            <CardComponent
                              key={card.id}
                              card={card}
                              isSelected={nightSelection.means === card.id || nightSelection.evidence === card.id}
                              onClick={() => handleMurdererSelection(card)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Accomplice Cards (if exists) */}
                    {gameState.accompliceId && gameState.players.find(p => p.id === gameState.accompliceId) && (
                      <div className="space-y-4">
                        <div className="text-center text-purple-400/80 font-serif font-bold uppercase tracking-widest text-sm border-b border-purple-500/20 pb-2 w-fit mx-auto">
                          {t.accompliceCards} ({gameState.players.find(p => p.id === gameState.accompliceId)?.name})
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-purple-950/20 rounded-xl border border-purple-500/30 backdrop-blur-sm">
                          {gameState.players.find(p => p.id === gameState.accompliceId)!.cards.map(card => (
                            <CardComponent
                              key={card.id}
                              card={card}
                              isSelected={nightSelection.means === card.id || nightSelection.evidence === card.id}
                              onClick={() => handleMurdererSelection(card)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center pb-10">
                       <button 
                         onClick={confirmMurder} 
                         disabled={!nightSelection.means || !nightSelection.evidence || gameState.isGeneratingNarrative}
                         className="bg-blood hover:bg-red-900 disabled:opacity-50 disabled:grayscale text-white px-12 py-4 rounded font-serif font-bold shadow-[0_0_30px_rgba(136,19,55,0.6)] flex items-center gap-3 border border-red-500/50"
                       >
                         {gameState.isGeneratingNarrative ? <RefreshCcw className="animate-spin" /> : <Skull size={24} />}
                         {gameState.isGeneratingNarrative ? "CONSTRUCTING SCENE..." : t.confirmCrime}
                       </button>
                    </div>
                 </div>
              ) : isScientistView ? (
                 <div className="h-full flex flex-col items-center justify-center text-amber-700/50 space-y-6">
                    <Eye size={80} className="animate-pulse drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
                    <p className="font-serif tracking-widest text-xl">{t.scientistNight}</p>
                 </div>
              ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-800 space-y-6">
                    <Moon size={100} className="text-mystic-800 drop-shadow-2xl" />
                    <p className="text-slate-600 font-serif uppercase tracking-[0.5em]">{t.nightPhase}</p>
                 </div>
              )}
            </div>
          )}

          {/* INVESTIGATION / VOTING / REPLACEMENT / GAME OVER */}
          {[GamePhase.INVESTIGATION, GamePhase.POST_ROUND_VOTING, GamePhase.REPLACE_TILE, GamePhase.GAME_OVER].includes(gameState.phase) && (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
                
                {/* AI NARRATIVE BANNER (Top of Investigation) */}
                {gameState.phase === GamePhase.INVESTIGATION && gameState.aiNarrative && (
                   <div className="lg:col-span-12 mb-4">
                     <motion.div 
                       initial={{ opacity: 0, y: -20 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="bg-slate-900/80 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-lg backdrop-blur-sm"
                     >
                       <div className="flex items-start gap-4">
                         <div className="bg-amber-900/30 p-2 rounded-full">
                           <FileText className="text-amber-500" size={24} />
                         </div>
                         <div className="flex-1">
                           <h3 className="text-amber-500 font-serif font-bold uppercase tracking-widest text-sm mb-2">
                             {gameState.language === 'vi' ? 'Hồ Sơ Vụ Án' : 'Case File #001'}
                           </h3>
                           <p className="text-slate-300 font-serif leading-relaxed italic text-lg">
                             "{gameState.aiNarrative}"
                           </p>
                           <div className="mt-2 text-xs text-slate-500 uppercase tracking-wider">
                             Generated by AI Game Master based on real evidence
                           </div>
                         </div>
                       </div>
                     </motion.div>
                   </div>
                )}

                {/* VOTING OVERLAY PHASE */}
                <AnimatePresence>
                  {gameState.phase === GamePhase.POST_ROUND_VOTING && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center"
                    >
                      <div className="bg-black/60 absolute inset-0 backdrop-blur-[2px]"></div>
                      <div className="relative pointer-events-auto bg-slate-900 border-2 border-red-500 rounded-xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.5)] max-w-lg w-full text-center space-y-6">
                          <h2 className="text-3xl font-serif font-bold text-red-500 uppercase tracking-widest animate-pulse">
                            {t.overtime}
                          </h2>
                          <div className="text-6xl font-mono font-bold text-white tabular-nums">
                            {formatTime(timeLeft)}
                          </div>
                          <p className="text-slate-300 text-sm">
                            {gameState.language === 'vi' 
                              ? "Thời gian thảo luận đã hết. Bạn có muốn kết án ngay bây giờ không?" 
                              : "Discussion time is over. Do you want to accuse now?"}
                          </p>
                          <div className="flex gap-4 justify-center">
                             <button 
                               onClick={() => setShowAccusationModal(true)}
                               className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded font-serif font-bold tracking-wider shadow-lg transform hover:scale-105 transition-all"
                             >
                               {t.voteAccuse}
                             </button>
                             <button 
                               className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-8 py-3 rounded font-serif font-bold tracking-wider"
                               onClick={handleVotePass}
                             >
                               {t.votePass}
                             </button>
                          </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Scene Tiles Area */}
                <div className="lg:col-span-4 order-2 lg:order-1 space-y-4">
                   <div className={clsx(
                     "rounded-xl p-4 border transition-colors relative backdrop-blur-sm",
                     gameState.phase === GamePhase.REPLACE_TILE && isScientistView ? "bg-blood/10 border-blood/50 shadow-[0_0_20px_rgba(136,19,55,0.2)]" : "bg-black/40 border-white/5"
                   )}>
                      <h3 className="text-amber-500 font-serif font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-sm border-b border-white/5 pb-2">
                        <Fingerprint size={18} /> {t.investigationPhase}
                      </h3>

                      {gameState.phase === GamePhase.REPLACE_TILE && isScientistView && (
                        <div className="absolute top-0 left-0 right-0 bg-blood text-white text-center py-2 text-xs font-bold rounded-t-xl animate-pulse font-serif tracking-widest z-20">
                          {t.replaceTileInstruct}
                        </div>
                      )}

                      <div className="space-y-6 flex flex-col items-center">
                        {/* Cause of Death - Permanent */}
                        <div className="w-full relative group/tile">
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-center text-purple-400 font-serif text-[10px] uppercase tracking-widest">Fatal Key</label>
                            {isScientistView && gameState.phase === GamePhase.INVESTIGATION && gameState.causeOfDeathTile.selectedOptionIndex !== null && (
                                <button onClick={() => checkClueWithAI('cause_of_death')} className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-amber-500" title="Ask AI Referee">
                                  <BrainCircuit size={12}/> Check
                                </button>
                            )}
                          </div>
                          <SceneTile 
                             tile={{...gameState.causeOfDeathTile, name: t.causeOfDeath}}
                             isForensicScientist={isScientistView}
                             onPlaceBullet={handleBulletPlacement}
                             isActive={gameState.phase === GamePhase.INVESTIGATION}
                             isReplacementMode={gameState.phase === GamePhase.REPLACE_TILE} 
                          />
                        </div>
                        
                        {/* Separator */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                        {/* Random Scene Tiles */}
                        <div className="w-full space-y-4">
                           <label className="block text-center text-amber-600 font-serif text-[10px] uppercase tracking-widest">Crime Details</label>
                           <AnimatePresence>
                             {gameState.sceneTiles.map(tile => (
                               <div key={tile.id} className="relative group/tile">
                                  {isScientistView && gameState.phase === GamePhase.INVESTIGATION && tile.selectedOptionIndex !== null && (
                                    <button 
                                      onClick={() => checkClueWithAI(tile.id)} 
                                      className="absolute -right-2 top-0 text-[10px] flex items-center gap-1 bg-slate-800 border border-slate-600 text-slate-400 hover:text-amber-500 hover:border-amber-500 px-2 py-0.5 rounded-full z-20 opacity-0 group-hover/tile:opacity-100 transition-opacity"
                                    >
                                      <BrainCircuit size={10}/> Consult AI
                                    </button>
                                  )}
                                  <SceneTile 
                                    tile={tile} 
                                    isForensicScientist={isScientistView}
                                    onPlaceBullet={handleBulletPlacement}
                                    onReplaceTile={handleReplaceTile}
                                    isActive={gameState.phase === GamePhase.INVESTIGATION}
                                    isReplacementMode={gameState.phase === GamePhase.REPLACE_TILE}
                                  />
                               </div>
                             ))}
                           </AnimatePresence>
                        </div>
                        
                        {/* Controls */}
                        {isScientistView && gameState.phase === GamePhase.INVESTIGATION && (
                           <button onClick={nextPhase} className={clsx(
                               "w-full p-3 rounded text-sm font-serif uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg border transition-all",
                               gameState.currentRound < 3 ? "bg-mystic-800 hover:bg-mystic-700 text-slate-300 border-mystic-600" : "bg-rose-900/80 hover:bg-rose-800 text-white border-rose-600"
                           )}>
                              {gameState.currentRound < 3 
                                ? <>{t.nextRound} {gameState.currentRound} <ArrowRight size={14} /></>
                                : <>{t.finalRound} <Skull size={14} /></>
                              }
                           </button>
                        )}
                      </div>
                   </div>
                </div>

                {/* Players & Cards Area */}
                <div className="lg:col-span-8 order-1 lg:order-2 space-y-6">
                   
                   {/* Game Over Banner */}
                   <AnimatePresence>
                     {gameState.phase === GamePhase.GAME_OVER && (
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }} 
                          animate={{ scale: 1, opacity: 1 }}
                          className={clsx(
                             "p-8 rounded-xl text-center border-2 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-xl",
                             gameState.winner === 'POLICE' ? "bg-sky-950/80 border-sky-400" : "bg-blood/80 border-rose-500"
                          )}
                        >
                           <h2 className="text-3xl md:text-5xl font-serif font-black uppercase mb-2 text-white drop-shadow-lg tracking-widest">
                             {gameState.winner === 'POLICE' ? t.victoryPolice : t.victoryMurderer}
                           </h2>
                           <p className="text-lg opacity-90 text-white/80 font-sans italic">{gameState.winReason}</p>
                           
                           <div className="mt-8 inline-flex gap-8 bg-black/50 p-6 rounded border border-white/10 items-center">
                              <div className="text-right">
                                 <div className="text-xs uppercase text-slate-400 font-serif">The Killer</div>
                                 <div className="font-bold text-blood text-2xl font-serif">{gameState.players.find(p => p.id === gameState.murdererId)?.name}</div>
                              </div>
                              <div className="h-10 w-px bg-white/20"></div>
                              <div className="text-left">
                                 <div className="text-xs uppercase text-slate-400 font-serif">The Truth</div>
                                 <div className="font-bold text-white text-xl">
                                   {MEANS_CARDS.find(c => c.id === gameState.solution?.meansId)?.name} + {EVIDENCE_CARDS.find(c => c.id === gameState.solution?.evidenceId)?.name}
                                 </div>
                              </div>
                           </div>

                           <div className="mt-8">
                             <button onClick={() => window.location.reload()} className="bg-white text-black px-8 py-3 rounded-full font-serif font-bold hover:scale-105 transition-transform flex items-center gap-2 mx-auto shadow-lg">
                                <RefreshCcw size={18} /> {t.playAgain}
                             </button>
                           </div>
                        </motion.div>
                     )}
                   </AnimatePresence>

                   {/* Player Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {gameState.players.filter(p => p.role !== Role.FORENSIC_SCIENTIST).map(player => {
                        const isMurderer = player.id === gameState.murdererId;
                        const isAccomplice = player.id === gameState.accompliceId;
                        
                        let showRole = false;
                        if (gameState.phase === GamePhase.GAME_OVER) showRole = true;
                        else if (isScientistView) showRole = true;
                        else if (isMurdererView && isAccomplice) showRole = true; 
                        else if (isAccompliceView && isMurderer) showRole = true; 
                        else if (player.id === gameState.activePlayerId) showRole = true; 
                        
                        return (
                          <div key={player.id} className={clsx(
                             "relative p-4 rounded-lg border transition-all group backdrop-blur-sm",
                             isScientistView && isMurderer ? "bg-blood/10 border-blood/40" : "bg-black/30 border-white/5 hover:border-white/20",
                             !player.hasBadge && "opacity-50 grayscale"
                          )}>
                             <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                                <div className="flex items-center gap-3">
                                   <div className="relative">
                                      <div className={clsx(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all text-white border shadow-md font-serif",
                                        player.avatarColor || "bg-slate-800",
                                        player.isSpeaking && !isDeafened && "shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                      )}>
                                        {player.name[0]}
                                      </div>
                                      {player.isSpeaking && !isDeafened && (
                                        <span className="absolute inset-0 rounded-full border border-green-400 animate-ping opacity-75"></span>
                                      )}
                                      {player.isMuted && (
                                         <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 border border-slate-700">
                                            <MicOff size={10} className="text-red-500"/>
                                         </div>
                                      )}
                                   </div>

                                   <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                          <span className={clsx("font-serif font-bold text-lg", player.id === gameState.activePlayerId ? "text-spirit" : "text-slate-300")}>{player.name}</span>
                                          
                                          {player.isSpeaking && !isDeafened && (
                                            <Volume2 size={14} className="text-green-400 animate-pulse" />
                                          )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {showRole ? <RoleIcon role={player.role} /> : <RoleIcon role={Role.INVESTIGATOR} className="opacity-30" />}
                                        {showRole && (
                                          <span className={clsx("text-[9px] px-1 rounded uppercase tracking-wider font-bold", 
                                            player.role === Role.MURDERER ? "bg-blood/20 text-red-400" : 
                                            player.role === Role.ACCOMPLICE ? "bg-purple-900/20 text-purple-400" :
                                            player.role === Role.WITNESS ? "bg-emerald-900/20 text-emerald-400" :
                                            "bg-sky-900/20 text-sky-400"
                                          )}>
                                            {player.role}
                                          </span>
                                        )}
                                      </div>
                                   </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                   {!player.hasBadge && (
                                      <div className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-700 bg-black/50 grayscale opacity-60" title={t.badgeLost}>
                                        <Shield className="w-5 h-5 text-slate-600" />
                                        <X className="w-4 h-4 text-slate-500 absolute" />
                                      </div>
                                   )}
                                   {player.hasBadge && (
                                     <div className="relative group/badge" title="Has Badge">
                                       {/* Physical Badge Look */}
                                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-amber-200 shadow-md flex items-center justify-center relative overflow-hidden">
                                          <div className="absolute inset-[2px] border border-amber-700 rounded-full opacity-40"></div>
                                          <Shield className="text-amber-900 w-5 h-5 fill-amber-800/30" />
                                          <div className="absolute top-1 left-1 w-3 h-1.5 bg-white/40 rotate-45 rounded-full blur-[1px]"></div>
                                       </div>
                                     </div>
                                   )}
                                </div>
                             </div>

                             <div className="grid grid-cols-4 gap-2 pl-2">
                               {player.cards.map(card => {
                                  if (!card) return null; // Defensive check for undefined cards
                                  const isSolutionMean = gameState.solution?.meansId === card.id;
                                  const isSolutionEv = gameState.solution?.evidenceId === card.id;
                                  const highlight = (showRole && (isSolutionMean || isSolutionEv));

                                  return (
                                    <div key={card.id} className={clsx(
                                       "transform scale-75 origin-top-left -mr-6 -mb-8 transition-transform hover:z-20 hover:scale-105",
                                       highlight && "ring-2 ring-spirit rounded-lg z-10 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                                    )}>
                                       <CardComponent card={card} disabled={true} />
                                    </div>
                                  );
                               })}
                             </div>
                             <div className="h-12"></div>
                          </div>
                        );
                      })}
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* Chat Overlay */}
        <AnimatePresence>
           {showChat && (
             <motion.div 
               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
               className="absolute top-0 right-0 bottom-0 w-80 md:w-96 glass-panel border-l border-white/10 shadow-2xl z-40 flex flex-col"
             >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                   <h3 className="font-serif font-bold text-spirit flex items-center gap-2">
                     <Users size={18} />
                     {t.chat}
                   </h3>
                   <button onClick={() => setShowChat(false)} className="hover:text-white text-slate-500"><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/40">
                   {gameState.chatMessages.map(msg => {
                     const sender = gameState.players.find(p => p.id === msg.senderId);
                     return (
                       <div key={msg.id} className={clsx(
                         "text-sm rounded p-2 border border-white/5 flex gap-3",
                         msg.isSystem ? "bg-amber-900/10 border-l-2 border-l-amber-600 pl-3" : "bg-white/5"
                       )}>
                          {/* Avatar for Chat */}
                          {!msg.isSystem && (
                            <div className={clsx(
                               "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-white/10 shrink-0 self-start mt-0.5 font-serif",
                               sender?.avatarColor || "bg-slate-700"
                            )}>
                              {msg.senderName[0]}
                            </div>
                          )}
                          {msg.isSystem && (
                             <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-amber-500/30 bg-amber-900/20 text-amber-500 shrink-0 self-start mt-0.5 font-serif">
                                !
                             </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                               <span className="font-bold font-serif" 
                                 style={{color: msg.isSystem ? "#f59e0b" : "#22d3ee"}}
                               >
                                 {msg.senderName}
                               </span>
                               <span className="opacity-50">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className={clsx("text-slate-300 break-words", msg.isSystem && "italic text-amber-200/60")}>{msg.text}</div>
                          </div>
                       </div>
                     );
                   })}
                </div>

                <form onSubmit={sendChatMessage} className="p-3 border-t border-white/10 bg-black/40">
                   <div className="flex gap-2">
                      <input 
                        value={chatInput} onChange={e => setChatInput(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-spirit text-white placeholder-slate-600"
                        placeholder={t.typeMessage}
                      />
                      <button type="submit" className="bg-mystic-700 p-2 rounded text-spirit hover:bg-mystic-600"><SendIcon /></button>
                   </div>
                </form>
             </motion.div>
           )}
        </AnimatePresence>

        {/* Action Bar */}
        {!isScientistView && gameState.players.find(p => p.id === gameState.activePlayerId)?.hasBadge && (gameState.phase === GamePhase.INVESTIGATION || gameState.phase === GamePhase.POST_ROUND_VOTING) && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none flex justify-center pb-8 z-30">
             <button 
               onClick={() => setShowAccusationModal(true)}
               className="pointer-events-auto bg-sky-800/90 hover:bg-sky-700 backdrop-blur text-white px-10 py-3 rounded-full font-serif font-bold shadow-[0_0_20px_rgba(7,89,133,0.5)] flex items-center gap-2 transform hover:scale-105 transition-all border border-sky-500/30"
             >
                <Gavel size={20} /> {t.accuse}
             </button>
          </div>
        )}
      </main>

      {/* Accusation Modal */}
      <AnimatePresence>
         {showAccusationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
               <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel border border-sky-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                  <div className="p-5 border-b border-white/10 flex justify-between items-center bg-sky-950/30">
                     <h2 className="text-xl font-serif text-sky-400 font-bold tracking-widest">{t.accuse}</h2>
                     <button onClick={() => setShowAccusationModal(false)} className="text-slate-400 hover:text-white"><X /></button>
                  </div>
                  
                  <div className="p-6 space-y-8 flex-1 overflow-y-auto">
                     {/* 1. Suspect */}
                     <div>
                        <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4 font-bold font-serif border-b border-white/5 pb-1">1. Who is the Killer?</h3>
                        <div className="flex flex-wrap gap-3">
                           {gameState.players.filter(p => p.role !== Role.FORENSIC_SCIENTIST).map(p => {
                              const showRoleIcon = (isScientistView) || (isAccompliceView && p.role === Role.MURDERER) || (isMurdererView && p.role === Role.ACCOMPLICE) || p.id === gameState.activePlayerId;
                              
                              return (
                                <button key={p.id} onClick={() => setAccusationSelection(s => ({...s, suspectId: p.id, means: null, evidence: null}))}
                                  className={clsx("px-4 py-3 rounded border transition-all flex items-center gap-2 font-serif", accusationSelection.suspectId === p.id ? "bg-sky-700 border-sky-400 text-white shadow-lg" : "bg-white/5 border-white/10 text-slate-400 hover:border-white/30")}
                                >
                                   <div className={clsx(
                                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-white/20 shadow-sm font-serif text-white",
                                      p.avatarColor || "bg-slate-800"
                                    )}>
                                      {p.name[0]}
                                   </div>
                                   {p.name}
                                   {showRoleIcon ? <RoleIcon role={p.role} /> : <RoleIcon role={Role.INVESTIGATOR} className="opacity-50" />}
                                </button>
                              );
                           })}
                        </div>
                     </div>

                     {/* 2 & 3 Cards */}
                     {accusationSelection.suspectId && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                           <div>
                              <h3 className="text-xs uppercase tracking-[0.2em] text-rose-400 mb-4 font-bold font-serif border-b border-rose-900/30 pb-1">2. {t.weapon}</h3>
                              <div className="grid grid-cols-2 gap-3">
                                 {gameState.players.find(p => p.id === accusationSelection.suspectId)?.cards.filter(c => c.type === CardType.MEANS).map(c => (
                                    <div key={c.id} onClick={() => setAccusationSelection(s => ({...s, means: c.id}))} 
                                      className={clsx("p-3 text-xs border rounded cursor-pointer text-center transition-colors font-serif", accusationSelection.means === c.id ? "bg-rose-950/60 border-rose-500 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.3)]" : "bg-black/30 border-white/10 text-slate-400 hover:bg-white/5")}
                                    >
                                       {c.name}
                                    </div>
                                 ))}
                              </div>
                           </div>
                           <div>
                              <h3 className="text-xs uppercase tracking-[0.2em] text-sky-400 mb-4 font-bold font-serif border-b border-sky-900/30 pb-1">3. {t.evidence}</h3>
                              <div className="grid grid-cols-2 gap-3">
                                 {gameState.players.find(p => p.id === accusationSelection.suspectId)?.cards.filter(c => c.type === CardType.EVIDENCE).map(c => (
                                    <div key={c.id} onClick={() => setAccusationSelection(s => ({...s, evidence: c.id}))} 
                                      className={clsx("p-3 text-xs border rounded cursor-pointer text-center transition-colors font-serif", accusationSelection.evidence === c.id ? "bg-sky-950/60 border-sky-500 text-sky-200 shadow-[0_0_10px_rgba(14,165,233,0.3)]" : "bg-black/30 border-white/10 text-slate-400 hover:bg-white/5")}
                                    >
                                       {c.name}
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-black/40">
                     <button onClick={() => setShowAccusationModal(false)} className="px-6 py-2 text-slate-400 hover:text-white font-serif">{t.cancel}</button>
                     <button onClick={submitAccusation} disabled={!accusationSelection.evidence || !accusationSelection.means} className="bg-sky-700 hover:bg-sky-600 disabled:opacity-50 text-white px-8 py-2 rounded font-serif font-bold tracking-wider shadow-lg">
                        {t.confirmAccusation}
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Gemini Assistant */}
      {gameState.phase === GamePhase.INVESTIGATION && (
        <GeminiAssistant gameState={gameState} />
      )}

    </div>
  );
};

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

export default App;
