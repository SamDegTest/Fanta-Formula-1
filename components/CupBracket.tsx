import React from 'react';
import Image from 'next/image';
import { MatchResult } from '@/lib/cupService';

interface BracketProps {
  quarterFinals: MatchResult[];
  semiFinals: MatchResult[];
  final: MatchResult;
}

export const CupBracket: React.FC<BracketProps> = ({ quarterFinals, semiFinals, final }) => {
  return (
    <div className="flex flex-row justify-between items-center gap-8 py-4 px-2 min-w-max">
      {/* Colonna Quarti */}
      <div className="flex flex-col gap-6 w-72">
        <h4 className="text-center text-[#F5A623] font-black tracking-widest text-xs uppercase mb-2">Quarti di Finale</h4>
        {quarterFinals.map(match => (
          <MatchCard key={match.matchId} match={match} />
        ))}
      </div>
      
      {/* Linee di connessione */}
      <div className="w-12 border-b-2 border-slate-700/50 mt-8"></div>
      
      {/* Colonna Semifinali */}
      <div className="flex flex-col gap-24 w-72">
        <h4 className="text-center text-[#F5A623] font-black tracking-widest text-xs uppercase mb-2">Semifinali</h4>
        {semiFinals.map(match => (
           <MatchCard key={match.matchId} match={match} />
        ))}
      </div>

      <div className="w-12 border-b-2 border-slate-700/50 mt-8"></div>

      {/* Colonna Finale */}
      <div className="flex flex-col w-80">
        <h4 className="text-center text-yellow-500 font-black tracking-widest text-sm uppercase mb-4 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">Gran Finale</h4>
        <MatchCard match={final} isFinal={true} />
      </div>
    </div>
  );
};

// Sub-component per mostrare la singola partita
const MatchCard = ({ match, isFinal = false }: { match: MatchResult, isFinal?: boolean }) => {
  const p1Name = match.player1?.id || 'In attesa...';
  const p2Name = match.player2?.id || 'In attesa...';
  
  return (
    <div className={`bg-[#1C2541] border ${isFinal ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'border-[#F5A623]/30 shadow-[0_4px_15px_rgba(0,0,0,0.3)]'} rounded-none overflow-hidden relative group hover:border-[#F5A623]/60 transition-colors`}>
      {/* Decorative corners */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${isFinal ? 'border-yellow-500' : 'border-[#F5A623]'} z-10 pointer-events-none`}></div>
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${isFinal ? 'border-yellow-500' : 'border-[#F5A623]'} z-10 pointer-events-none`}></div>
      
      <div className="flex flex-col divide-y divide-slate-700/50">
        <PlayerRow name={p1Name} score={match.player1?.pointsEarned} isFinal={isFinal} />
        <PlayerRow name={p2Name} score={match.player2?.pointsEarned} isFinal={isFinal} />
      </div>
    </div>
  );
};

const PlayerRow = ({ name, score, isFinal }: { name: string, score: number | undefined, isFinal: boolean }) => {
  const isTBD = name === 'In attesa...';
  const logoUrl = `/api/drive-images?type=team&name=${encodeURIComponent(name)}`;
  
  return (
    <div className={`flex justify-between items-center p-3 ${isTBD ? 'opacity-50 grayscale' : ''} hover:bg-[#2A365C] transition-colors`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`relative flex-shrink-0 ${isFinal ? 'h-10 w-10' : 'h-8 w-8'} rounded-full overflow-hidden border border-[#F5A623]/50 bg-[#0B132B]`}>
          {!isTBD ? (
            <Image 
              src={logoUrl} 
              alt={name} 
              fill
              sizes="40px"
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">?</div>
          )}
        </div>
        <span className={`font-bold tracking-wide truncate ${isFinal ? 'text-base' : 'text-sm'} ${isTBD ? 'text-slate-500 italic' : 'text-white'}`}>
          {name}
        </span>
      </div>
      <div className="ml-3 pl-3 border-l border-slate-700/50 h-full flex items-center justify-center">
        <span className={`font-mono font-black ${isFinal ? 'text-xl' : 'text-lg'} ${score !== undefined && score > 0 ? 'text-[#F5A623]' : 'text-slate-500'}`}>
          {score ?? '-'}
        </span>
      </div>
    </div>
  );
};
