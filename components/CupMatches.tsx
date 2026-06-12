import React from 'react';
import Image from 'next/image';
import { Matchday } from '@/lib/cupConfig';
import { calculateMatchResult } from '@/lib/cupService';
import { Trophy } from 'lucide-react';

interface CupMatchesProps {
  matchdays: Matchday[];
  getTeamName: (playerId: string | null) => string;
  scoresByRace: Record<string, Record<string, number>>;
}

export const CupMatches: React.FC<CupMatchesProps> = ({ 
  matchdays, 
  getTeamName, 
  scoresByRace 
}) => {
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
                 <MatchRow 
                    key={match.id} 
                    match={match} 
                    raceId={day.raceId} 
                    getTeamName={getTeamName} 
                    scoresByRace={scoresByRace}
                 />
              ))}
           </div>
        </div>
      ))}
    </div>
  );
};

const MatchRow = ({ 
  match, 
  raceId, 
  getTeamName, 
  scoresByRace 
}: { 
  match: any, 
  raceId: string, 
  getTeamName: any, 
  scoresByRace: Record<string, Record<string, number>>
}) => {
  const p1Name = getTeamName(match.player1);
  const p2Name = getTeamName(match.player2);
  
  if (!match.player1 || !match.player2) return null;

  const logo1 = `/api/drive-images?type=team&name=${encodeURIComponent(p1Name)}`;
  const logo2 = `/api/drive-images?type=team&name=${encodeURIComponent(p2Name)}`;

  const raceScores = scoresByRace[raceId] || {};
  const score1 = match.player1 in raceScores ? raceScores[match.player1] : '-';
  const score2 = match.player2 in raceScores ? raceScores[match.player2] : '-';

  const hasScores = typeof score1 === 'number' && typeof score2 === 'number';

  let p1Points = 0;
  let p2Points = 0;
  let isP1Winner = false;
  let isP2Winner = false;
  let isDraw = false;
  let outcomeText = '';

  if (hasScores) {
    const result = calculateMatchResult(match.player1, score1 as number, match.player2, score2 as number);
    p1Points = result.player1.pointsEarned;
    p2Points = result.player2.pointsEarned;
    
    if (p1Points > p2Points) {
      isP1Winner = true;
      outcomeText = `${p1Name} vince ${p1Points}-${p2Points}`;
    } else if (p2Points > p1Points) {
      isP2Winner = true;
      outcomeText = `${p2Name} vince ${p2Points}-${p1Points}`;
    } else {
      isDraw = true;
      outcomeText = `Pareggio 1-1`;
    }

  }

  return (
     <div className="p-3 sm:p-4 hover:bg-[#2A365C] transition-colors flex flex-col gap-2.5 relative group">
        {/* Riga Team 1 */}
        <div className={`flex items-center justify-between w-full transition-opacity duration-300 ${hasScores && isP2Winner ? 'opacity-40' : 'opacity-100'}`}>
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <div className={`relative flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden border ${hasScores && isP1Winner ? 'border-amber-400 shadow-[0_0_12px_rgba(245,166,35,0.6)]' : 'border-[#F5A623]/50'} bg-[#0B132B]`}>
                   <Image 
                      src={logo1} 
                      alt={p1Name} 
                      fill 
                      sizes="32px" 
                      className="object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                   />
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-sm sm:text-base font-bold tracking-wide truncate ${hasScores && isP1Winner ? 'text-amber-400 font-extrabold' : 'text-white'}`}>
                    {p1Name}
                  </span>
                  {hasScores && isP1Winner && (
                    <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  )}
                </div>
            </div>
            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                <div className={`font-mono font-black text-base sm:text-lg w-12 text-right ${hasScores && isP1Winner ? 'text-amber-400' : 'text-slate-300'}`}>
                    {score1}
                </div>
                {hasScores && (
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-full min-w-[3.2rem] text-center ${
                    p1Points === 3 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    p1Points === 2 ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' :
                    p1Points === 1 ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' :
                    'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    +{p1Points} PT
                  </span>
                )}
            </div>
        </div>

        {/* Riga Team 2 */}
        <div className={`flex items-center justify-between w-full transition-opacity duration-300 ${hasScores && isP1Winner ? 'opacity-40' : 'opacity-100'}`}>
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <div className={`relative flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden border ${hasScores && isP2Winner ? 'border-amber-400 shadow-[0_0_12px_rgba(245,166,35,0.6)]' : 'border-[#F5A623]/50'} bg-[#0B132B]`}>
                   <Image 
                      src={logo2} 
                      alt={p2Name} 
                      fill 
                      sizes="32px" 
                      className="object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                   />
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-sm sm:text-base font-bold tracking-wide truncate ${hasScores && isP2Winner ? 'text-amber-400 font-extrabold' : 'text-white'}`}>
                    {p2Name}
                  </span>
                  {hasScores && isP2Winner && (
                    <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  )}
                </div>
            </div>
            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                <div className={`font-mono font-black text-base sm:text-lg w-12 text-right ${hasScores && isP2Winner ? 'text-amber-400' : 'text-slate-300'}`}>
                    {score2}
                </div>
                {hasScores && (
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-full min-w-[3.2rem] text-center ${
                    p2Points === 3 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    p2Points === 2 ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' :
                    p2Points === 1 ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' :
                    'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    +{p2Points} PT
                  </span>
                )}
            </div>
        </div>

        {/* Outcome Description Banner */}
        {hasScores && (
          <div className="mt-1 text-[11px] font-semibold text-slate-400 bg-slate-900/50 px-2 py-1 border-l-2 border-[#F5A623] flex justify-between items-center rounded-r">
            <span>{outcomeText}</span>
            <span className="text-[10px] uppercase font-mono text-slate-500">
              Diff: {Math.abs((score1 as number) - (score2 as number))} pts
            </span>
          </div>
        )}
     </div>
  );
};

