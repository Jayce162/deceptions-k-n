
import { GoogleGenAI } from "@google/genai";
import { GameState, CardType, Card } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper: Format Game State for Prompting ---

const formatGameStateForAI = (gameState: GameState): string => {
  const { sceneTiles, causeOfDeathTile, players, language } = gameState;
  
  let clueString = `Cause of Death: ${causeOfDeathTile.selectedOptionIndex !== null ? causeOfDeathTile.options[causeOfDeathTile.selectedOptionIndex] : 'Unknown'}\n`;
  
  sceneTiles.forEach(tile => {
    if (tile.selectedOptionIndex !== null) {
      clueString += `${tile.name}: ${tile.options[tile.selectedOptionIndex]}\n`;
    }
  });

  let playersString = players
    .filter(p => p.role !== 'Forensic Scientist')
    .map(p => {
      const cards = p.cards.map(c => `[${c.type === CardType.MEANS ? 'Red' : 'Blue'}] ${c.name}`).join(', ');
      return `Player ${p.name}: ${cards}`;
    }).join('\n');

  return `
  LANGUAGE CONTEXT: ${language === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}
  CURRENT CLUES:
  ${clueString}

  SUSPECTS AND CARDS:
  ${playersString}
  `;
};

// --- Feature 1: Reasoning / Hint Bot ---

export async function getDetectiveHint(gameState: GameState, userQuestion: string): Promise<string> {
  const context = formatGameStateForAI(gameState);
  
  // Using Gemini 3 Pro for deep reasoning
  const modelId = 'gemini-3-pro-preview';
  
  const systemInstruction = `
    You are a brilliant detective assistant in the board game "Deception: Murder in Hong Kong".
    Your goal is to analyze the visible clues provided by the Forensic Scientist and match them against the Means (Red cards) and Evidence (Blue cards) held by the suspects.
    
    The Forensic Scientist cannot speak, they only place "bullets" on tiles to give hints.
    
    Analyze the "CURRENT CLUES" and compare them to "SUSPECTS AND CARDS".
    Identify logical connections.
    
    IMPORTANT: Respond in the language specified in the "LANGUAGE CONTEXT" (Vietnamese or English).
    If Vietnamese, use terms like "Pháp y", "Hung thủ", "Thám tử".
    
    Do not reveal the answer definitively if you don't know it, but offer probabilities and suspicion rankings.
    Keep the tone noir, mysterious, and helpful.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Here is the current game state:\n${context}\n\nUser Question: ${userQuestion}`,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 1024 }, // Enable reasoning
      }
    });

    return response.text || (gameState.language === 'vi' ? "Màn sương quá dày... tôi chưa thấy rõ sự thật." : "The fog is too thick... I cannot see the truth yet.");
  } catch (error) {
    console.error("Gemini Reasoning Error:", error);
    return gameState.language === 'vi' ? "Mất kết nối với hồ sơ vụ án." : "My connection to the archives is severed.";
  }
}

// --- Feature 2: Image Analysis (Visual Clue) ---

export async function analyzeUploadedEvidence(base64Image: string, language: 'en' | 'vi'): Promise<string> {
  // Using Gemini 3 Pro for high fidelity analysis (multimodal input -> text output)
  const modelId = 'gemini-3-pro-preview';

  const prompt = language === 'vi' 
    ? "Phân tích hình ảnh này. Mô tả vật thể và gợi ý xem nó có thể là 'Hung khí' (Weapon) hay 'Vật chứng' (Evidence) trong bối cảnh vụ án giết người không. Hãy sáng tạo."
    : "Analyze this image. Describe what object it is and suggest if it could be a 'Means of Murder' (Weapon) or 'Key Evidence' (Personal item, trace) in a murder mystery context. Be creative.";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          { text: prompt }
        ]
      }
    });

    return response.text || (language === 'vi' ? "Tôi không nhận diện được vật thể." : "I cannot make out what this is.");
  } catch (error) {
    console.error("Gemini Image Error:", error);
    return language === 'vi' ? "Lỗi phân tích hình ảnh." : "Failed to analyze the visual evidence.";
  }
}

// --- Feature 3: Narrative Generation (The Storyteller) ---

export async function generateCrimeSceneNarrative(
  means: Card, 
  evidence: Card, 
  language: 'en' | 'vi'
): Promise<string> {
  // Use Flash for faster creative writing
  const modelId = 'gemini-2.5-flash';

  const prompt = language === 'vi'
    ? `Viết một đoạn văn ngắn (khoảng 3-4 câu) mô tả hiện trường một vụ án mạng theo phong cách trinh thám noir.
       Hung khí thật sự là: "${means.name}".
       Vật chứng để lại là: "${evidence.name}".
       
       YÊU CẦU QUAN TRỌNG:
       1. KHÔNG ĐƯỢC nhắc trực tiếp tên của Hung khí và Vật chứng.
       2. Hãy mô tả gián tiếp, gợi ý về tính chất của chúng (ví dụ: nếu là 'Đá lạnh', hãy nói về vũng nước và cái lạnh thấu xương; nếu là 'Kiến', hãy nói về những vị khách không mời bé nhỏ).
       3. Mục đích là để người chơi (Thám tử) đọc và cảm nhận được manh mối nhưng vẫn phải suy luận.
       4. Bắt đầu bằng "Báo cáo hiện trường:..."`
    : `Write a short paragraph (3-4 sentences) describing a murder crime scene in a noir detective style.
       The actual Means (Weapon) is: "${means.name}".
       The actual Key Evidence is: "${evidence.name}".
       
       IMPORTANT REQUIREMENTS:
       1. DO NOT explicitly name the Means or Evidence.
       2. Describe them indirectly, hinting at their properties (e.g., if 'Ice', mention a puddle and chill; if 'Ants', mention tiny uninvited guests).
       3. The goal is for players (Investigators) to read this and get a "feel" for the clues without being told the answer.
       4. Start with "Crime Scene Report:..."`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        temperature: 1.0, // High creativity
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Narrative Error:", error);
    return "";
  }
}

// --- Feature 4: The Referee (Clue Evaluator) ---

export async function evaluateClueQuality(
  means: Card,
  evidence: Card,
  tileName: string,
  selectedOption: string,
  language: 'en' | 'vi'
): Promise<string> {
  // Use Flash for quick feedback
  const modelId = 'gemini-2.5-flash';

  const prompt = language === 'vi'
    ? `Bạn là trọng tài AI cho game "Deception: Murder in Hong Kong".
       Đáp án đúng: Hung khí="${means.name}", Vật chứng="${evidence.name}".
       Pháp y (người gợi ý) vừa chọn gợi ý: Thẻ "${tileName}" -> Chọn "${selectedOption}".
       
       Hãy đánh giá ngắn gọn (1 câu) xem gợi ý này có TỐT không? Nó có trỏ đúng về hướng Hung khí hoặc Vật chứng không? Hay nó gây nhiễu?
       Ví dụ: "Lựa chọn tốt, liên quan trực tiếp đến tính chất của [Tên Hung Khí]." hoặc "Hơi rủi ro, dễ gây hiểu nhầm sang [Thứ khác]."`
    : `You are an AI Referee for the game "Deception: Murder in Hong Kong".
       True Solution: Means="${means.name}", Evidence="${evidence.name}".
       Forensic Scientist just selected: Tile "${tileName}" -> Option "${selectedOption}".
       
       Give a concise (1 sentence) evaluation: Is this a GOOD clue? Does it point logically to the Means or Evidence?
       Example: "Strong clue, relates directly to [Means Name]." or "Risky, might mislead investigators towards [Something else]."`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    return "";
  }
}
