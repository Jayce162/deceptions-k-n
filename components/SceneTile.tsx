
import React from 'react';
import { SceneTileData } from '../types';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

interface SceneTileProps {
  tile: SceneTileData;
  isForensicScientist: boolean;
  onPlaceBullet?: (tileId: string, optionIndex: number) => void;
  onReplaceTile?: (tileId: string) => void;
  isActive?: boolean; // Can interact for bullet
  isReplacementMode?: boolean; // Can interact for destruction
}

export const SceneTile: React.FC<SceneTileProps> = ({ 
  tile, 
  isForensicScientist, 
  onPlaceBullet, 
  onReplaceTile,
  isActive,
  isReplacementMode 
}) => {
  
  const canInteract = isForensicScientist && (isActive || isReplacementMode);
  
  // Category Checks
  const isCauseOfDeath = tile.id === 'cause_of_death';
  const isLocation = tile.id.startsWith('loc_'); // Green
  const isPsychology = tile.id === 'profile'; // Orange
  const isForensic = tile.id === 'report'; // Gray
  const isTrick = tile.id === 'modus_operandi'; // Black
  const isSocial = tile.id === 'social'; // Pink

  // --- VISUAL THEME LOGIC ---
  
  let containerStyles = "bg-[#1c1917]/80 border-[#A16207]/40 shadow-[0_0_10px_rgba(161,98,7,0.15)]"; // Default Earth/Amber
  let headerStyles = "text-amber-100 bg-[#451a03]/30 border-b border-[#A16207]/30";
  let optionSelectedStyles = "bg-[#451a03] border-[#d97706] text-amber-50 text-shadow shadow-[0_0_10px_rgba(217,119,6,0.3)]";
  let optionHoverStyles = "hover:bg-[#292524] hover:border-[#d97706]/50";

  if (isCauseOfDeath) {
    containerStyles = "bg-[#2E1065]/80 border-[#7E22CE]/50 shadow-[0_0_15px_rgba(126,34,206,0.3)]"; // Purple
    headerStyles = "text-purple-200 bg-[#4C1D95]/30 border-b border-[#7E22CE]/30";
    optionSelectedStyles = "bg-[#581c87] border-[#a855f7] text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]";
    optionHoverStyles = "hover:bg-[#3b0764] hover:border-[#7e22ce]/50";
  } else if (isLocation) {
    containerStyles = "bg-[#064e3b]/80 border-emerald-600/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"; // Green
    headerStyles = "text-emerald-100 bg-emerald-900/40 border-b border-emerald-500/30";
    optionSelectedStyles = "bg-emerald-800 border-emerald-400 text-emerald-50 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
    optionHoverStyles = "hover:bg-emerald-900/50 hover:border-emerald-500/50";
  } else if (isPsychology) {
    containerStyles = "bg-[#431407]/90 border-orange-600/50 shadow-[0_0_15px_rgba(234,88,12,0.2)]"; // Orange
    headerStyles = "text-orange-200 bg-orange-900/40 border-b border-orange-500/30";
    optionSelectedStyles = "bg-orange-800 border-orange-500 text-orange-50 shadow-[0_0_10px_rgba(234,88,12,0.4)]";
    optionHoverStyles = "hover:bg-orange-900/50 hover:border-orange-500/50";
  } else if (isForensic) {
    containerStyles = "bg-[#1e293b]/90 border-slate-500/50 shadow-[0_0_15px_rgba(148,163,184,0.2)]"; // Gray
    headerStyles = "text-slate-200 bg-slate-800/50 border-b border-slate-500/30";
    optionSelectedStyles = "bg-slate-700 border-slate-400 text-white shadow-[0_0_10px_rgba(148,163,184,0.4)]";
    optionHoverStyles = "hover:bg-slate-800 hover:border-slate-400/50";
  } else if (isTrick) {
    containerStyles = "bg-black/95 border-zinc-600/80 shadow-[0_0_15px_rgba(255,255,255,0.1)]"; // Black/Zinc
    headerStyles = "text-zinc-300 bg-zinc-900 border-b border-zinc-600";
    optionSelectedStyles = "bg-zinc-800 border-zinc-400 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]";
    optionHoverStyles = "hover:bg-zinc-900 hover:border-zinc-500/50";
  } else if (isSocial) {
    containerStyles = "bg-[#500724]/90 border-pink-600/50 shadow-[0_0_15px_rgba(236,72,153,0.2)]"; // Pink
    headerStyles = "text-pink-200 bg-pink-900/40 border-b border-pink-500/30";
    optionSelectedStyles = "bg-pink-800 border-pink-400 text-pink-50 shadow-[0_0_10px_rgba(236,72,153,0.4)]";
    optionHoverStyles = "hover:bg-pink-900/50 hover:border-pink-500/50";
  }
  
  const optionBaseStyles = "relative p-2 text-xs md:text-sm text-center rounded-sm border transition-all duration-200 min-h-[3rem] flex items-center justify-center font-medium font-sans leading-tight select-none";

  // Replacement Mode Check: Only non-fixed cards (Not CauseOfDeath AND Not Location) can be replaced
  const isReplacable = !isCauseOfDeath && !isLocation;
  const canReplaceThisTile = isReplacementMode && isForensicScientist && isReplacable;
  const isLockedInReplacement = isReplacementMode && !isReplacable;

  return (
    <motion.div 
      initial={tile.isNew ? { opacity: 0, x: 50 } : {}}
      animate={{ opacity: 1, x: 0 }}
      className={clsx(
        "relative p-1 rounded-md transition-all duration-300 backdrop-blur-md w-full max-w-sm select-none border",
        containerStyles,
        canReplaceThisTile && "cursor-pointer hover:ring-4 hover:ring-red-500/70 hover:scale-[1.02] hover:grayscale-[0.5]",
        isReplacementMode && !isForensicScientist && !isCauseOfDeath && "opacity-50 blur-[1px]",
        isLockedInReplacement && "opacity-50" // Dim fixed cards during replacement phase
      )}
      onClick={() => {
        if (canReplaceThisTile && onReplaceTile) {
          onReplaceTile(tile.id);
        }
      }}
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] pointer-events-none rounded-md"></div>

      {/* Selection Overlay for Replacement */}
      {canReplaceThisTile && (
        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm rounded-md">
          <div className="flex flex-col items-center animate-pulse">
             <XCircle className="text-red-500 w-12 h-12 drop-shadow-[0_0_10px_red]" />
             <span className="text-red-100 font-serif font-bold mt-2 uppercase tracking-widest text-xs bg-red-900/80 px-2 py-1 rounded">Discard Tile</span>
          </div>
        </div>
      )}

      <div className="p-2 relative z-10">
        {/* Header */}
        <h3 className={clsx(
          "font-serif font-bold text-center mb-2 py-1.5 uppercase tracking-[0.15em] text-xs md:text-sm rounded-sm",
          headerStyles
        )}>
          {tile.name}
        </h3>
        
        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {tile.options.map((option, index) => {
            const isSelected = tile.selectedOptionIndex === index;
            
            return (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent tile replacement click
                  if (isForensicScientist && isActive && onPlaceBullet) {
                    onPlaceBullet(tile.id, index);
                  }
                }}
                className={clsx(
                  optionBaseStyles,
                  isForensicScientist && isActive ? clsx("cursor-pointer", optionHoverStyles) : "cursor-default",
                  isSelected ? optionSelectedStyles : "bg-black/20 border-transparent text-white/40 hover:text-white/70"
                )}
              >
                {option}
                
                {/* WOODEN BULLET MARKER */}
                {isSelected && (
                  <motion.div
                    layoutId={`bullet-${tile.id}`}
                    initial={{ scale: 3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="absolute -top-2 -right-2 z-30 pointer-events-none"
                  >
                    <div className="relative w-8 h-8">
                       {/* Shadow */}
                       <div className="absolute bottom-[-4px] right-[-4px] w-full h-full bg-black/70 rounded-full blur-[3px]"></div>
                       
                       {/* Bullet Geometry (Cylinder viewed from top) */}
                       <div className="absolute inset-0 rounded-full border border-[#3E2723] overflow-hidden shadow-inner"
                            style={{
                              background: 'radial-gradient(circle at 30% 30%, #8D6E63 0%, #5D4037 50%, #3E2723 100%)'
                            }}
                       >
                          {/* Wood Grain Rings */}
                          <div className="absolute inset-[2px] rounded-full border border-[#4E342E]/40 opacity-60"></div>
                          <div className="absolute inset-[5px] rounded-full border border-[#4E342E]/40 opacity-50"></div>
                          <div className="absolute inset-[8px] rounded-full border border-[#4E342E]/40 opacity-40"></div>
                          
                          {/* Brass Casing Center Detail */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#FFD700] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] opacity-80"></div>
                       </div>
                       
                       {/* Specular Highlight (Glossy Wood Polish) */}
                       <div className="absolute top-1 left-2 w-3 h-1.5 bg-white/30 rounded-full rotate-[-15deg] blur-[0.5px]"></div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Decorative Corner Screws */}
      <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-[#78716c] shadow-[inset_0_0_1px_black]"></div>
      <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#78716c] shadow-[inset_0_0_1px_black]"></div>
      <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-[#78716c] shadow-[inset_0_0_1px_black]"></div>
      <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-[#78716c] shadow-[inset_0_0_1px_black]"></div>

    </motion.div>
  );
};
