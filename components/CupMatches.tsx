import React from 'react';
import Image from 'next/image';
import { Matchday } from '@/lib/cupConfig';

interface CupMatchesProps {
  matchdays: Matchday[];
  getTeamName: (playerId: string | null) => string;
}

export const CupMatches: React.FC<CupMatchesProps> = ({ matchdays, getTeamName }) => {
  return (
    <div className="space-y-6">
      {matchdays.map((day, idx) => (
        <div key={day.raceId} className="bg-[#1C2541] rounded-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-[#F5A623]/30 overflow-hidden relative group">
           {/* Decorative corners */}
           <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#F5A623] z-10 pointer-events-none"></div>
           <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#F5A623] z-10 pointer-events-none"></div>
           
           {/* Header */}
           <div className="px-4 py-2 bg-[#0B132B] border-b border-[#F5A623]/30 flex justify-between items-center relative z-10">
             <h4 className="text-[#F5A623] font-black tracking-widest text-xs uppercase">Giornata {idx + 1}</h4>
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{day.raceId}</span>
           </div>

           {/* Matches list */}
           <div className="divide-y divide-slate-700/50">
              {day.matches.map(match => (
                 <MatchRow key={match.id} match={match} getTeamName={getTeamName} />
              ))}
           </div>
        </div>
      ))}
    </div>
  );
};

const MatchRow = ({ match, getTeamName }: { match: any, getTeamName: any }) => {
  const p1Name = getTeamName(match.player1);
  const p2Name = getTeamName(match.player2);
  
  if (!match.player1 || !match.player2) return null;

  const logo1 = `/api/drive-images?type=team&name=${encodeURIComponent(p1Name)}`;
  const logo2 = `/api/drive-images?type=team&name=${encodeURIComponent(p2Name)}`;

  const score1 = '-';
  const score2 = '-';

  return (
     <div className="p-3 sm:p-4 hover:bg-[#2A365C] transition-colors flex flex-col gap-2">
        {/* Struttura Mobile-First tipo Flashscore/Sofascore */}
        
        {/* Riga Team 1 */}
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <div className="relative flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden border border-[#F5A623]/50 bg-[#0B132B] shadow-[0_0_10px_rgba(245,166,35,0.2)]">
                   <Image 
                      src={logo1} 
                      alt={p1Name} 
                      fill 
                      sizes="32px" 
                      className="object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                   />
                </div>
                <span className="text-sm sm:text-base font-bold text-white tracking-wide truncate">{p1Name}</span>
            </div>
            <div className="flex-shrink-0 ml-4 font-mono font-black text-base sm:text-lg text-slate-400 w-6 text-center">
                {score1}
            </div>
        </div>

        {/* Riga Team 2 */}
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <div className="relative flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden border border-[#F5A623]/50 bg-[#0B132B] shadow-[0_0_10px_rgba(245,166,35,0.2)]">
                   <Image 
                      src={logo2} 
                      alt={p2Name} 
                      fill 
                      sizes="32px" 
                      className="object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                   />
                </div>
                <span className="text-sm sm:text-base font-bold text-white tracking-wide truncate">{p2Name}</span>
            </div>
            <div className="flex-shrink-0 ml-4 font-mono font-black text-base sm:text-lg text-slate-400 w-6 text-center">
                {score2}
            </div>
        </div>
     </div>
  );
};
