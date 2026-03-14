import React from 'react';
import { Match } from '@/lib/types';
import { Swords } from 'lucide-react';

const ProssimiScontriBanner = ({ matches }: { matches: Match[] }) => {
  // TODO: Implement logic to find the *actual* next matches
  const nextMatches = matches.slice(0, 2); // Simple placeholder

  if (nextMatches.length === 0) {
    return (
        <div className="bg-gradient-to-r from-[#0B132B] to-[#1C2541] border border-[#F5A623]/20 text-white p-6 rounded-none shadow-lg mb-8 text-center animate-fade-in">
            <h2 className="text-xl font-black tracking-wider text-[#F5A623] uppercase">Prossimi Scontri</h2>
            <p className="text-slate-300 mt-2">Non ci sono scontri in programma al momento.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#0B132B] to-[#1C2541] border border-[#F5A623]/20 text-white p-6 rounded-none shadow-lg mb-8 animate-fade-in">
        <h2 className="text-xl font-black tracking-wider text-center text-[#F5A623] uppercase mb-4">Prossimi Scontri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            {nextMatches.map((match, index) => (
                <div key={index} className="bg-[#0B132B]/50 p-4 rounded-none border border-slate-700 flex items-center justify-center space-x-4">
                    <span className={`font-bold text-lg ${match.player1.username.includes('BYE') ? 'text-slate-500' : 'text-white'}`}>
                        {match.player1.username}
                    </span>
                    <Swords className="h-6 w-6 text-[#F5A623]" />
                    <span className={`font-bold text-lg ${!match.player2 || match.player2.username.includes('BYE') ? 'text-slate-500' : 'text-white'}`}>
                        {match.player2 ? match.player2.username : '...'}
                    </span>
                </div>
            ))}
        </div>
    </div>
  );
};

export default ProssimiScontriBanner;
