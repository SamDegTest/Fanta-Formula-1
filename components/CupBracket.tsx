import React from 'react';
import Image from 'next/image';

export interface BracketParticipant {
  id: string | null;
  teamName: string;
  andata: number | null;
  ritorno: number | null;
  total: number | null;
}

export interface BracketMatch {
  matchId: string;
  player1: BracketParticipant;
  player2: BracketParticipant;
  winnerId: string | null;
}

interface BracketProps {
  quarterFinals: BracketMatch[];
  semiFinals: BracketMatch[];
  final: BracketMatch;
}

export const CupBracket: React.FC<BracketProps> = ({ quarterFinals, semiFinals, final }) => {
  return (
    <div className="flex flex-row justify-between items-center gap-8 py-4 px-2 min-w-max">
      {/* Colonna Quarti */}
      <div className="flex flex-col gap-6 w-80">
        <h4 className="text-center text-[#F5A623] font-black tracking-widest text-xs uppercase mb-2">Quarti di Finale (Andata/Ritorno)</h4>
        {quarterFinals.map(match => (
          <MatchCard key={match.matchId} match={match} />
        ))}
      </div>
      
      {/* Linee di connessione */}
      <div className="w-12 border-b-2 border-slate-700/50 mt-8"></div>
      
      {/* Colonna Semifinali */}
      <div className="flex flex-col gap-24 w-80">
        <h4 className="text-center text-[#F5A623] font-black tracking-widest text-xs uppercase mb-2">Semifinali (Andata/Ritorno)</h4>
        {semiFinals.map(match => (
           <MatchCard key={match.matchId} match={match} />
        ))}
      </div>

      <div className="w-12 border-b-2 border-slate-700/50 mt-8"></div>

      {/* Colonna Finale */}
      <div className="flex flex-col w-80">
        <h4 className="text-center text-yellow-500 font-black tracking-widest text-sm uppercase mb-4 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">Gran Finale (Gara Secca)</h4>
        <MatchCard match={final} isFinal={true} />
      </div>
    </div>
  );
};

// Sub-component per mostrare la singola partita
const MatchCard = ({ match, isFinal = false }: { match: BracketMatch, isFinal?: boolean }) => {
  const p1 = match.player1;
  const p2 = match.player2;
  
  return (
    <div className={`bg-[#1C2541] border ${isFinal ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'border-[#F5A623]/30 shadow-[0_4px_15px_rgba(0,0,0,0.3)]'} rounded-none overflow-hidden relative group hover:border-[#F5A623]/60 transition-colors`}>
      {/* Decorative corners */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${isFinal ? 'border-yellow-500' : 'border-[#F5A623]'} z-10 pointer-events-none`}></div>
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${isFinal ? 'border-yellow-500' : 'border-[#F5A623]'} z-10 pointer-events-none`}></div>
      
      <div className="flex flex-col divide-y divide-slate-700/50">
        <PlayerRow 
          name={p1.teamName} 
          andata={p1.andata} 
          ritorno={p1.ritorno} 
          total={p1.total} 
          isFinal={isFinal} 
          isWinner={match.winnerId !== null && match.winnerId === p1.id}
          isLoser={match.winnerId !== null && match.winnerId !== p1.id}
        />
        <PlayerRow 
          name={p2.teamName} 
          andata={p2.andata} 
          ritorno={p2.ritorno} 
          total={p2.total} 
          isFinal={isFinal} 
          isWinner={match.winnerId !== null && match.winnerId === p2.id}
          isLoser={match.winnerId !== null && match.winnerId !== p2.id}
        />
      </div>
    </div>
  );
};

const PlayerRow = ({ 
  name, 
  andata, 
  ritorno, 
  total, 
  isFinal,
  isWinner = false,
  isLoser = false
}: { 
  name: string, 
  andata: number | null | undefined, 
  ritorno: number | null | undefined, 
  total: number | null | undefined, 
  isFinal: boolean,
  isWinner?: boolean,
  isLoser?: boolean
}) => {
  const isTBD = name.includes('Girone') || name.includes('Vincitore') || name === 'In attesa...';
  const logoUrl = `/api/drive-images?type=team&name=${encodeURIComponent(name)}`;
  
  return (
    <div className={`flex justify-between items-center p-3 transition-all duration-300 ${isTBD ? 'opacity-50 grayscale' : ''} ${isLoser ? 'opacity-40' : ''} ${isWinner ? 'bg-amber-500/10' : ''} hover:bg-[#2A365C]`}>
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <div className={`relative flex-shrink-0 ${isFinal ? 'h-10 w-10' : 'h-8 w-8'} rounded-full overflow-hidden border ${isWinner ? 'border-amber-400 shadow-[0_0_10px_rgba(245,166,35,0.5)]' : 'border-[#F5A623]/50'} bg-[#0B132B]`}>
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
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-wide truncate ${isFinal ? 'text-base' : 'text-sm'} ${isWinner ? 'text-amber-400 font-extrabold' : isTBD ? 'text-slate-500 italic' : 'text-white'}`}>
              {name}
            </span>
            {isWinner && (
              <span className="text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 rounded-sm uppercase tracking-wider">
                Vince
              </span>
            )}
          </div>
          {!isFinal && !isTBD && (andata !== null || ritorno !== null) && (
            <span className="text-[10px] text-slate-400 font-mono">
              And: {andata !== null ? andata : '-'} | Rit: {ritorno !== null ? ritorno : '-'}
            </span>
          )}
        </div>
      </div>
      <div className="ml-3 pl-3 border-l border-slate-700/50 h-full flex items-center justify-center min-w-[3rem] text-right">
        <span className={`font-mono font-black ${isFinal ? 'text-xl' : 'text-lg'} ${isWinner ? 'text-amber-400' : total !== null && total !== undefined ? 'text-[#F5A623]' : 'text-slate-500'}`}>
          {total !== null ? total : '-'}
        </span>
      </div>
    </div>
  );
};
