
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, Send, Loader2, X } from 'lucide-react';
import { GameState } from '../types';
import { getDetectiveHint, analyzeUploadedEvidence } from '../services/geminiService';

interface GeminiAssistantProps {
  gameState: GameState;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ gameState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'image'>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: "I am reviewing the case files. Ask me for a deduction based on the current clues." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    const hint = await getDetectiveHint(gameState, userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', text: hint }]);
    setIsLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for API
        const base64Data = base64String.split(',')[1];
        
        setAnalyzedImage(base64String);
        setIsLoading(true);
        const analysis = await analyzeUploadedEvidence(base64Data, gameState.language);
        setMessages(prev => [...prev, { role: 'ai', text: `Visual Analysis: ${analysis}` }]);
        setActiveTab('chat'); // Switch back to chat to see result
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 border-2 border-indigo-400"
      >
        {isOpen ? <X /> : <Sparkles />}
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-slate-800 border border-slate-600 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-indigo-400 font-serif font-bold flex items-center gap-2">
                <Sparkles size={18} /> AI Detective
              </h3>
              <div className="flex gap-2 text-xs">
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={`px-2 py-1 rounded ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                >Chat</button>
                <button 
                  onClick={() => setActiveTab('image')}
                  className={`px-2 py-1 rounded ${activeTab === 'image' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                >Scan Evidence</button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50 scrollbar-thin">
              {activeTab === 'chat' ? (
                <>
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-indigo-900/50 text-indigo-100 border border-indigo-700 rounded-tr-none' 
                          : 'bg-slate-700 text-slate-200 border border-slate-600 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-700 p-3 rounded-lg rounded-tl-none flex gap-2 items-center">
                        <Loader2 className="animate-spin text-indigo-400" size={16} />
                        <span className="text-xs text-slate-400">Consulting archives...</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  {analyzedImage ? (
                    <img src={analyzedImage} alt="Analyzed" className="w-full h-48 object-cover rounded-lg border border-slate-600" />
                  ) : (
                    <div className="w-full h-48 bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center">
                      <span className="text-slate-500 text-sm">No Image</span>
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload}
                  />
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-white font-medium transition-colors"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Upload size={18} />}
                    Upload Photo
                  </button>
                  <p className="text-xs text-slate-500 px-4">
                    Take a photo of a real-life object to see if the AI classifies it as a Weapon or Evidence.
                  </p>
                </div>
              )}
            </div>

            {/* Input Area (Only for Chat) */}
            {activeTab === 'chat' && (
              <div className="p-3 bg-slate-900 border-t border-slate-700 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Who looks suspicious?"
                  className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
