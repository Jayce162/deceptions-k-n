
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Grid, Shield, Skull, Eye, Ghost, FlaskConical } from 'lucide-react';
import { TRANSLATIONS, MEANS_CARDS, EVIDENCE_CARDS } from '../constants';
import { CardComponent } from './Card';
import { clsx } from 'clsx';
import { Language, Role } from '../types';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, language }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'gallery'>('rules');
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-950">
           <div className="flex items-center gap-3">
              <BookOpen className="text-amber-500" />
              <h2 className="text-xl font-serif font-bold text-slate-200">{t.gameGuide}</h2>
           </div>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={24} />
           </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900/50">
           <button 
             onClick={() => setActiveTab('rules')}
             className={clsx(
               "flex-1 py-4 font-serif font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2",
               activeTab === 'rules' ? "bg-slate-800 text-amber-500 border-b-2 border-amber-500" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
             )}
           >
             <BookOpen size={16} /> {t.howToPlay}
           </button>
           <button 
             onClick={() => setActiveTab('gallery')}
             className={clsx(
               "flex-1 py-4 font-serif font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2",
               activeTab === 'gallery' ? "bg-slate-800 text-spirit border-b-2 border-spirit" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
             )}
           >
             <Grid size={16} /> {t.cardGallery}
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/30 scrollbar-thin">
           
           {/* RULES TAB */}
           {activeTab === 'rules' && (
             <div className="space-y-8 max-w-3xl mx-auto">
                <div className="prose prose-invert">
                   <p className="text-lg text-slate-300 italic text-center font-serif leading-relaxed border-b border-white/5 pb-6">
                      "{t.rules.intro}"
                   </p>
                </div>

                {/* Roles Section */}
                <div className="space-y-4">
                   <h3 className="text-amber-500 font-serif font-bold uppercase tracking-widest border-b border-amber-500/20 pb-2 mb-4">
                     {t.rules.rolesTitle}
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {t.rules.roles.map((role, idx) => {
                         let Icon = Shield;
                         let colorClass = "text-slate-400";
                         
                         if (idx === 0) { Icon = FlaskConical; colorClass = "text-amber-500"; } // Scientist
                         if (idx === 1) { Icon = Skull; colorClass = "text-red-500"; } // Murderer
                         if (idx === 2) { Icon = Shield; colorClass = "text-sky-400"; } // Investigator
                         if (idx === 3) { Icon = Ghost; colorClass = "text-purple-400"; } // Accomplice
                         if (idx === 4) { Icon = Eye; colorClass = "text-emerald-400"; } // Witness

                         return (
                           <div key={idx} className="bg-slate-900/50 p-4 rounded-lg border border-white/5 flex gap-4 items-start">
                              <div className={clsx("p-2 rounded bg-black/30", colorClass)}>
                                <Icon size={24} />
                              </div>
                              <div>
                                 <h4 className={clsx("font-bold font-serif mb-1", colorClass)}>{role.title}</h4>
                                 <p className="text-sm text-slate-400 leading-relaxed">{role.desc}</p>
                              </div>
                           </div>
                         )
                      })}
                   </div>
                </div>

                {/* Flow Section */}
                <div className="space-y-4">
                   <h3 className="text-spirit font-serif font-bold uppercase tracking-widest border-b border-spirit/20 pb-2 mb-4">
                     {t.rules.flowTitle}
                   </h3>
                   <div className="relative border-l-2 border-slate-700 ml-4 space-y-8 py-2">
                      {t.rules.flow.map((step, idx) => (
                        <div key={idx} className="relative pl-8">
                           <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-800 border-2 border-spirit"></div>
                           <h4 className="font-bold text-spirit font-serif text-lg mb-1">{step.title}</h4>
                           <p className="text-slate-400">{step.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}

           {/* GALLERY TAB */}
           {activeTab === 'gallery' && (
             <div className="space-y-12">
                <div>
                   <h3 className="text-center font-serif font-bold text-2xl text-red-500 mb-6 uppercase tracking-widest flex items-center justify-center gap-3">
                      <Skull /> {t.weapon} ({MEANS_CARDS.length})
                   </h3>
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
                      {MEANS_CARDS.map(card => (
                         <div key={card.id} className="hover:z-10 transition-transform hover:scale-110">
                            <CardComponent card={card} disabled />
                         </div>
                      ))}
                   </div>
                </div>

                <div className="border-t border-white/10 pt-10">
                   <h3 className="text-center font-serif font-bold text-2xl text-sky-400 mb-6 uppercase tracking-widest flex items-center justify-center gap-3">
                      <Shield /> {t.evidence} ({EVIDENCE_CARDS.length})
                   </h3>
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
                      {EVIDENCE_CARDS.map(card => (
                         <div key={card.id} className="hover:z-10 transition-transform hover:scale-110">
                            <CardComponent card={card} disabled />
                         </div>
                      ))}
                   </div>
                </div>
             </div>
           )}

        </div>
      </motion.div>
    </div>
  );
};
