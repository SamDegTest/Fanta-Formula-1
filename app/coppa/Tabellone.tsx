import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Network, Swords, Calendar, Shield, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MapPin, CheckCircle2 } from 'lucide-react';

const MatchCard = ({ match, participants, usernameToTeamName }: { match: any, participants: any[], usernameToTeamName: Record<string, string> }) => {
    const hasScores = match.score_a !== null && match.score_b !== null;

    const userA = participants.find(p => p.username === match.user_a_id);
    const userB = participants.find(p => p.username === match.user_b_id);

    const getAvatarUrl = (username: string) => {
        const teamName = usernameToTeamName[username] || username;
        if (!teamName || username.includes('BYE')) return `https://ui-avatars.com/api/?name=?&background=0B132B&color=F5A623&font-size=0.5&bold=true`;
        return `/api/drive-images?type=team&name=${encodeURIComponent(teamName)}`;
    }
    
    const fallbackAvatar = (username: string) => {
        const teamName = usernameToTeamName[username] || username;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=0B132B&color=F5A623&font-size=0.5&bold=true`;
    }

    let scoreClassA = 'text-slate-300';
    let scoreClassB = 'text-slate-300';
    let cardBorderClass = 'border-slate-700';

    if (hasScores) {
        const scoreA = Number(match.score_a);
        const scoreB = Number(match.score_b);

        if (match.winner === match.user_a_id) {
            scoreClassA = 'text-green-400';
            scoreClassB = 'text-red-400';
            cardBorderClass = 'border-green-500/30';
        } else if (match.winner === match.user_b_id) {
            scoreClassA = 'text-red-400';
            scoreClassB = 'text-green-400';
            cardBorderClass = 'border-red-500/30';
        } else if (scoreA === scoreB) {
            scoreClassA = 'text-yellow-400';
            scoreClassB = 'text-yellow-400';
            cardBorderClass = 'border-yellow-500/30';
        }
    }
    
    const teamNameA = usernameToTeamName[match.user_a_id] || match.user_a_id;
    const teamNameB = usernameToTeamName[match.user_b_id] || match.user_b_id;

    return (
        <div className={`bg-[#0B132B]/70 border ${cardBorderClass} rounded-lg p-3 w-full shadow-md`}>
            {/* Race Info Header */}
            {match.race_info && (
                <div className="pb-2 mb-3 border-b border-slate-700/50 text-xs text-slate-400 flex flex-col gap-2">
                    <p className="font-bold text-xs text-slate-100 text-center truncate">{match.race_info.meeting_name}</p>
                    <div className='flex justify-between items-center'>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-[#F5A623]" />
                            <span className="font-semibold truncate">{match.race_info.circuit_short_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(match.race_info.date_start).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Match Players and Scores */}
            <div className="grid grid-cols-5 items-center gap-2">
                {/* User A */}
                <div className="col-span-2 flex items-center gap-2">
                    <div className="relative w-8 h-8 flex-shrink-0">
                        <Image 
                            src={getAvatarUrl(match.user_a_id)} 
                            alt={teamNameA}
                            fill
                            sizes="32px"
                            className="rounded-full object-cover bg-slate-800"
                            onError={(e) => { (e.target as HTMLImageElement).src = fallbackAvatar(match.user_a_id); }}
                        />
                    </div>
                    <span className={`font-semibold text-sm truncate ${match.user_a_id.includes('BYE') ? 'text-slate-500' : 'text-white'}`}>{teamNameA}</span>
                </div>

                {/* Scores */}
                <div className="col-span-1 text-center">
                    <span className={`font-black text-base ${scoreClassA}`}>{hasScores ? match.score_a : '-'}</span>
                    <span className="text-slate-500 mx-1 text-sm">:</span>
                    <span className={`font-black text-base ${scoreClassB}`}>{hasScores ? match.score_b : '-'}</span>
                </div>

                {/* User B */}
                 <div className="col-span-2 flex items-center gap-2 justify-end">
                    <span className={`font-semibold text-sm truncate text-right ${match.user_b_id.includes('BYE') ? 'text-slate-500' : 'text-white'}`}>{teamNameB}</span>
                    <div className="relative w-8 h-8 flex-shrink-0">
                         <Image 
                            src={getAvatarUrl(match.user_b_id)} 
                            alt={teamNameB}
                            fill
                            sizes="32px"
                            className="rounded-full object-cover bg-slate-800"
                            onError={(e) => { (e.target as HTMLImageElement).src = fallbackAvatar(match.user_b_id); }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const DayAccordion = ({ dayName, matches, participants, usernameToTeamName }: { dayName: string, matches: any[], participants: any[], usernameToTeamName: Record<string, string> }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isCompleted = matches.length > 0 && matches.every(m => m.score_a !== null && m.score_b !== null);

    return (
        <div className={`border rounded-md overflow-hidden mb-2 last:mb-0 transition-colors ${isCompleted ? 'bg-[#0B132B]/30 border-slate-700/30' : 'bg-[#0B132B]/40 border-slate-700/30'}`}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 hover:bg-[#0B132B]/60 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <span className={`font-semibold text-sm sm:text-base pl-2 border-l-2 transition-colors ${isCompleted ? 'text-slate-400 border-green-500' : 'text-slate-300 border-[#F5A623] group-hover:text-white'}`}>{dayName}</span>
                    {isCompleted && (
                         <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-900/10 px-2 py-0.5 rounded-full border border-green-500/20 uppercase tracking-wide">
                            <CheckCircle2 className="h-3 w-3" />
                            SVOLTA
                        </span>
                    )}
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500 group-hover:text-[#F5A623]" /> : <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-[#F5A623]" />}
            </button>
            
            {isOpen && (
                <div className="p-3 space-y-3 border-t border-slate-700/30 animate-fade-in">
                    {matches.map(match => (
                        <MatchCard key={match.id} match={match} participants={participants} usernameToTeamName={usernameToTeamName} />
                    ))}
                </div>
            )}
        </div>
    );
};

const GroupAccordion = ({ groupName, days, participants, usernameToTeamName }: { groupName: string, days: Record<string, any[]>, participants: any[], usernameToTeamName: Record<string, string> }) => {
    const [isOpen, setIsOpen] = useState(true);
    
    const sortedDayNames = Object.keys(days).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
    });

    return (
        <div className="bg-[#1C2541]/50 border border-slate-700/50 rounded-lg overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#1C2541] transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <Shield className={`h-5 w-5 ${isOpen ? 'text-[#F5A623]' : 'text-slate-400 group-hover:text-[#F5A623]'}`} />
                    <span className={`font-bold text-lg tracking-wide uppercase ${isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{groupName}</span>
                </div>
                {isOpen ? <ChevronUp className="h-5 w-5 text-[#F5A623]" /> : <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-[#F5A623]" />}
            </button>
            
            {isOpen && (
                <div className="p-3 sm:p-4 space-y-2 border-t border-slate-700/50 bg-[#0B132B]/30 animate-fade-in">
                    {sortedDayNames.map(dayName => (
                        <DayAccordion key={dayName} dayName={dayName} matches={days[dayName]} participants={participants} usernameToTeamName={usernameToTeamName} />
                    ))}
                </div>
            )}
        </div>
    );
};

const GroupStage = ({ rounds, participants, usernameToTeamName }: { rounds: any, participants: any[], usernameToTeamName: Record<string, string> }) => {
    const groups: Record<string, Record<string, any[]>> = {};

    Object.keys(rounds).forEach((roundName) => {
        const parts = roundName.split(' - ');
        const groupName = parts[0];
        const dayName = parts.slice(1).join(' - ') || 'Giornata Unica';

        if (!groups[groupName]) groups[groupName] = {};
        if (!groups[groupName][dayName]) groups[groupName][dayName] = [];
        
        groups[groupName][dayName].push(...rounds[roundName]);
    });

    const sortedGroupNames = Object.keys(groups).sort();

    return (
        <div className="space-y-4">
            {sortedGroupNames.map((groupName) => (
                <GroupAccordion key={groupName} groupName={groupName} days={groups[groupName]} participants={participants} usernameToTeamName={usernameToTeamName} />
            ))}
        </div>
    );
};


const KnockoutStage = ({ rounds, participants, usernameToTeamName }: { rounds: { [key: string]: any[] }, participants: any[], usernameToTeamName: Record<string, string> }) => {
    const roundNames = Object.keys(rounds);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = 300;
            const targetScroll = direction === 'left' 
                ? container.scrollLeft - scrollAmount 
                : container.scrollLeft + scrollAmount;
            
            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group/bracket">
            <button 
                onClick={() => scroll('left')}
                className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 p-2 bg-[#0B132B] border border-[#F5A623]/30 rounded-full text-[#F5A623] shadow-[0_0_15px_rgba(0,0,0,0.5)] opacity-0 group-hover/bracket:opacity-100 transition-all hover:bg-[#F5A623] hover:text-[#0B132B] hover:scale-110"
                aria-label="Scorri a sinistra"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            
            <div className="md:hidden absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0B132B] to-transparent z-10 pointer-events-none"></div>
            <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0B132B] to-transparent z-10 pointer-events-none"></div>

            <div 
                ref={scrollContainerRef}
                className="flex space-x-4 overflow-x-auto py-4 px-4 sm:px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {roundNames.map((roundName) => (
                    <div key={roundName} className="flex flex-col items-center flex-shrink-0 snap-center snap-always w-[90vw] sm:w-80">
                        <h4 className="font-bold text-lg text-[#F5A623] mb-6 tracking-wide uppercase whitespace-nowrap">{roundName}</h4>
                        <div className="flex flex-col justify-around h-full space-y-4 w-full">
                            {rounds[roundName].map((match) => (
                                <MatchCard key={match.id} match={match} participants={participants} usernameToTeamName={usernameToTeamName} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={() => scroll('right')}
                className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 p-2 bg-[#0B132B] border border-[#F5A623]/30 rounded-full text-[#F5A623] shadow-[0_0_15px_rgba(0,0,0,0.5)] opacity-0 group-hover/bracket:opacity-100 transition-all hover:bg-[#F5A623] hover:text-[#0B132B] hover:scale-110"
                aria-label="Scorri a destra"
            >
                <ChevronRight className="h-6 w-6" />
            </button>
        </div>
    );
};


const Tabellone = ({ cup, participants, usernameToTeamName }: { cup: any, participants: any[], usernameToTeamName: Record<string, string> }) => {
    if (!cup || !cup.matches || cup.matches.length === 0) {
        return (
            <div className="bg-[#1C2541]/50 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-lg">
                <div className="p-4 border-b border-slate-700/50 flex items-center space-x-3">
                    <Network className="h-6 w-6 text-[#F5A623]" />
                    <h3 className="font-black text-xl text-white tracking-wider uppercase">Tabellone</h3>
                </div>
                <div className="p-4 sm:p-6">
                    <p className="text-slate-400 text-center py-10">Non ci sono scontri definiti per questa coppa.</p>
                </div>
            </div>
        );
    }

    const allRounds = cup.matches.reduce((acc: any, match: any) => {
        const roundName = match.round || 'Sconosciuto';
        if (!acc[roundName]) acc[roundName] = [];
        acc[roundName].push(match);
        return acc;
    }, {});
    
    const roundOrder = ['Girone', 'Ottavi di Finale', 'Quarti di Finale', 'Semifinale', 'Finale'];
    const sortedRoundNames = Object.keys(allRounds).sort((a, b) => {
        const aIndex = roundOrder.findIndex(prefix => a.startsWith(prefix));
        const bIndex = roundOrder.findIndex(prefix => b.startsWith(prefix));
        if (aIndex !== bIndex) return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex);
        return a.localeCompare(b);
    });

    const groupRounds: { [key: string]: any[] } = {};
    const knockoutRounds: { [key: string]: any[] } = {};

    sortedRoundNames.forEach(name => {
        if (name.startsWith('Girone')) {
            groupRounds[name] = allRounds[name];
        } else {
            knockoutRounds[name] = allRounds[name];
        }
    });
    
    const areGroupStagesComplete = (rounds: { [key: string]: any[] }): boolean => {
        if (Object.keys(rounds).length === 0) return true;
        return Object.values(rounds).flat().every(match => match.score_a !== null && match.score_b !== null);
    };

    const hasGroupStage = Object.keys(groupRounds).length > 0;
    const hasKnockoutStage = Object.keys(knockoutRounds).length > 0;

    return (
        <div className="bg-[#1C2541]/50 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-lg">
            <div className="p-4 border-b border-slate-700/50 flex items-center space-x-3">
                <Network className="h-6 w-6 text-[#F5A623]" />
                <h3 className="font-black text-xl text-white tracking-wider uppercase">Scontri della Coppa</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-10">
                {hasGroupStage && (
                    <div>
                         <h3 className="font-black text-2xl text-white tracking-wide uppercase mb-6">Fase a Gironi</h3>
                         <GroupStage rounds={groupRounds} participants={participants} usernameToTeamName={usernameToTeamName} />
                    </div>
                )}
                {hasKnockoutStage && areGroupStagesComplete(groupRounds) && (
                     <div>
                         <h3 className="font-black text-2xl text-white tracking-wide uppercase mb-2">Fase a Eliminazione Diretta</h3>
                        <KnockoutStage rounds={knockoutRounds} participants={participants} usernameToTeamName={usernameToTeamName} />
                     </div>
                )}
                {hasKnockoutStage && !areGroupStagesComplete(groupRounds) && (
                    <div>
                        <h3 className="font-black text-2xl text-slate-600 tracking-wide uppercase mb-2">Fase a Eliminazione Diretta</h3>
                        <div className="text-center py-10 px-6 bg-[#0B132B]/50 border-2 border-dashed border-slate-700 rounded-lg">
                            <p className="text-slate-400">Il tabellone sarà disponibile al termine della fase a gironi.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tabellone;
