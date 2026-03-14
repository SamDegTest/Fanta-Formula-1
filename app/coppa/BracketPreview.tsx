import React from 'react';
import { Swords, Users } from 'lucide-react';
import { Bracket, Match } from '@/lib/types';

interface BracketPreviewProps {
  bracket: Bracket | null;
}


const BracketPreview: React.FC<BracketPreviewProps> = ({ bracket }) => {
  if (!bracket) {
    return null;
  }

  // Renders a single match (reusable)
  const renderMatch = (match: Match, index: number) => (
    <div key={index} className="bg-[#0B132B] border border-slate-700 rounded-none px-4 py-3 flex items-center justify-between animate-fade-in">
      <span className={`font-semibold ${match.player1.username.includes('BYE') ? 'text-slate-500' : 'text-white'}`}>
        {match.player1.username}
      </span>
      <Swords className="h-5 w-5 text-[#F5A623] mx-4" />
      <span className={`font-semibold ${!match.player2 || match.player2.username.includes('BYE') ? 'text-slate-500' : 'text-white'}`}>
        {match.player2 ? match.player2.username : '...'}
      </span>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Render Group Stage if it exists */}
      {bracket.groups && bracket.groups.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-black text-xl text-[#F5A623] tracking-wide uppercase">Fase a Gironi</h3>
          {bracket.groups.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-[#0B132B]/50 border border-slate-700 rounded-none p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="h-5 w-5 text-[#F5A623]" />
                <h4 className="font-bold text-lg text-white">{group.name}</h4>
              </div>
              <ul className="space-y-2">
                {group.participants.map((p, pIndex) => (
                  <li key={pIndex} className="text-slate-300 pl-4">{p.username}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Render Knockout Stage */}
      {bracket.knockout && bracket.knockout.rounds.length > 0 && (
        <div className="space-y-6">
           <h3 className="font-black text-xl text-[#F5A623] tracking-wide uppercase">Fase a Eliminazione Diretta</h3>
          {bracket.knockout.rounds.map((round, roundIndex) => (
            <div key={roundIndex}>
              <h4 className="font-bold text-lg text-white mb-3 tracking-wide">{round.name}</h4>
              <div className="space-y-3">
                  {round.matches.map(renderMatch)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BracketPreview;
