'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Trophy, CalendarDays, Swords, LayoutGrid } from 'lucide-react';
import { CupStandings } from '@/components/CupStandings';
import { CupBracket } from '@/components/CupBracket';
import { CupMatches } from '@/components/CupMatches';
import { cupConfig, CupPlayer } from '@/lib/cupConfig';

export default function CoppaPage() {
  const [activeView, setActiveView] = useState<'gironi' | 'fase-finale'>('gironi');
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0);

  // Funzione helper per ottenere il nome della squadra dato un PlayerId
  const getTeamName = (playerId: string | null) => {
    if (!playerId) return 'TBD';
    for (const group of cupConfig.groups) {
      const player = group.players.find(p => p.id === playerId);
      if (player) return player.teamName;
    }
    return playerId;
  };

  // Generiamo una classifica iniziale (tutti a 0 punti) basata sulla configurazione reale.
  const getStandingsForGroup = (players: CupPlayer[]) => {
    return players.map(player => ({
      username: player.teamName, // Mostriamo il nome della squadra invece dell'username
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
    }));
  };

  const activeGroup = cupConfig.groups[activeGroupIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
      {/* Intestazione Coppa con Immagine */}
      <div className="mb-8 flex flex-col items-center justify-center gap-6">
        <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 flex items-center justify-center bg-[#1C2541] rounded-full border-4 border-[#F5A623]/80 overflow-hidden shadow-[0_0_35px_rgba(245,166,35,0.4)] transition-transform hover:scale-105 duration-300">
          <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-[#F5A623] absolute z-0" />
          <Image 
            src={`/api/drive-images?type=league&name=cricchetto_cup`} 
            alt="Piston Cup Logo" 
            fill
            sizes="(max-width: 640px) 96px, 128px"
            className="object-cover relative z-10"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-widest uppercase drop-shadow-md text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] to-[#D35400]">Piston Cup</span>
        </h1>
      </div>

      {/* Sotto-Menu */}
      <div className="flex justify-center mb-10">
        <div className="bg-[#1C2541] p-1 rounded-full flex gap-1 border border-[#F5A623]/30 shadow-lg">
          <button
            onClick={() => setActiveView('gironi')}
            className={`px-6 py-2.5 rounded-full text-sm sm:text-base font-bold transition-all flex items-center gap-2 ${
              activeView === 'gironi' 
                ? 'bg-[#F5A623] text-[#0B132B] shadow-[0_0_15px_rgba(245,166,35,0.4)]' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="hidden sm:inline">Fase a</span> Gironi
          </button>
          <button
            onClick={() => setActiveView('fase-finale')}
            className={`px-6 py-2.5 rounded-full text-sm sm:text-base font-bold transition-all flex items-center gap-2 ${
              activeView === 'fase-finale' 
                ? 'bg-[#F5A623] text-[#0B132B] shadow-[0_0_15px_rgba(245,166,35,0.4)]' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-5 h-5" />
            Fase Finale
          </button>
        </div>
      </div>

      {/* VISTA: FASE A GIRONI */}
      {activeView === 'gironi' && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
          
          {/* Selettore Girone */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {cupConfig.groups.map((group, index) => (
              <button
                key={group.id}
                onClick={() => setActiveGroupIndex(index)}
                className={`px-5 py-2 border-b-2 font-black tracking-wider uppercase transition-colors ${
                  activeGroupIndex === index
                    ? 'border-[#F5A623] text-[#F5A623]'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>

          {/* Contenuto Girone Attivo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Colonna Sinistra: Classifica */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
               <div className="flex items-center gap-3 mb-4 pl-1">
                 <Trophy className="w-5 h-5 text-[#F5A623]" />
                 <h2 className="text-xl font-bold text-white tracking-wide">Classifica {activeGroup.name}</h2>
               </div>
               <CupStandings 
                  groupId={activeGroup.name} 
                  standings={getStandingsForGroup(activeGroup.players)} 
                />
            </div>

            {/* Colonna Destra: Calendario Match */}
            <div className="lg:col-span-7">
               <div className="flex items-center gap-3 mb-4 pl-1">
                 <CalendarDays className="w-5 h-5 text-[#F5A623]" />
                 <h2 className="text-xl font-bold text-white tracking-wide">Calendario & Risultati</h2>
               </div>
               
               <div className="bg-[#050A1F]/50 p-1 rounded-xl border border-slate-800/50">
                 <CupMatches matchdays={activeGroup.matchdays} getTeamName={getTeamName} />
               </div>
            </div>

          </div>
        </div>
      )}

      {/* VISTA: FASE FINALE */}
      {activeView === 'fase-finale' && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-8">
             <Swords className="w-6 h-6 text-[#F5A623]" />
             <h2 className="text-2xl font-black text-white tracking-widest uppercase">Tabellone a Eliminazione</h2>
          </div>

          <div className="w-full bg-[#050A1F]/80 rounded-xl p-4 md:p-8 shadow-2xl border border-[#F5A623]/20 overflow-x-auto scrollbar-thin scrollbar-thumb-[#F5A623]/50 scrollbar-track-transparent">
            <div className="min-w-max mx-auto">
              <CupBracket 
                quarterFinals={cupConfig.bracket.quarterFinals.matches.map(m => ({
                  matchId: m.id, 
                  player1: { id: getTeamName(m.player1), raceScore: 0, pointsEarned: 0 }, 
                  player2: { id: getTeamName(m.player2), raceScore: 0, pointsEarned: 0 }
                })) as any}
                semiFinals={cupConfig.bracket.semiFinals.matches.map(m => ({
                  matchId: m.id, 
                  player1: { id: getTeamName(m.player1), raceScore: 0, pointsEarned: 0 }, 
                  player2: { id: getTeamName(m.player2), raceScore: 0, pointsEarned: 0 }
                })) as any}
                final={{
                  matchId: cupConfig.bracket.final.matches[0].id, 
                  player1: { id: getTeamName(cupConfig.bracket.final.matches[0].player1), raceScore: 0, pointsEarned: 0 }, 
                  player2: { id: getTeamName(cupConfig.bracket.final.matches[0].player2), raceScore: 0, pointsEarned: 0 }
                } as any}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
