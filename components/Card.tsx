import React from 'react';
import { Card as CardType } from '../types';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export const CardComponent: React.FC<CardProps> = ({ card, isSelected, onClick, disabled }) => {
  const isMeans = card.type === 'MEANS';

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.05, y: -5, boxShadow: isMeans ? "0 0 15px rgba(225, 29, 72, 0.4)" : "0 0 15px rgba(14, 165, 233, 0.4)" } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={() => !disabled && onClick && onClick()}
      className={clsx(
        "relative w-24 h-36 md:w-28 md:h-40 rounded-lg shadow-lg cursor-pointer border flex flex-col items-center justify-center p-2 text-center transition-all duration-300 select-none overflow-hidden",
        // Mystic Theme Colors
        isMeans ? "bg-red-950 border-red-900 text-red-100" : "bg-slate-900 border-slate-700 text-sky-100",
        // Selected State (Glowing)
        isSelected && (isMeans ? "ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]" : "ring-2 ring-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.6)]") + " z-10 scale-105",
        // Disabled State
        disabled && "opacity-70 cursor-not-allowed grayscale-[0.3]"
      )}
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]"></div>
      
      {/* Inner Border Frame */}
      <div className={clsx(
        "absolute inset-1 border rounded opacity-30",
        isMeans ? "border-red-400" : "border-sky-300"
      )}></div>

      <span className="relative z-10 font-serif font-bold text-sm md:text-base leading-tight drop-shadow-md">
        {card.name}
      </span>
      
      {/* Type Label (Bottom) */}
      <div className={clsx(
        "absolute bottom-2 left-2 right-2 text-[8px] uppercase tracking-widest py-0.5 border-t border-b font-sans font-bold opacity-80",
        isMeans ? "border-red-500 text-red-300" : "border-sky-500 text-sky-300"
      )}>
        {isMeans ? 'Weapon' : 'Evidence'}
      </div>

      {/* Top Decorative Icon (Abstract) */}
      <div className={clsx(
        "absolute top-2 w-2 h-2 rounded-full opacity-50",
        isMeans ? "bg-red-500" : "bg-sky-500"
      )}></div>

    </motion.div>
  );
};