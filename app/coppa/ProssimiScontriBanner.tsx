import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import Image from 'next/image';
import { Swords, CalendarClock, Calendar, Shield, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

const translateSessionName = (name: string) => {
    const translations: { [key: string]: string } = {
      'Practice 1': 'Prove Libere 1',
      'Practice 2': 'Prove Libere 2',
      'Practice 3': 'Prove Libere 3',
      'Qualifying': 'Qualifiche',
      'Sprint': 'Sprint',
      'Race': 'Gara',
    };
    return translations[name] || name;
  };

const UpcomingMatchCard = ({ match, participants, usernameToTeamName }: { match: any; participants: any[]; usernameToTeamName: Record<string, string> }) => {
    const userA = participants.find(p => p.username === match.user_a_id);
    const userB = participants.find(p => p.username === match.user_b_id);

    const getAvatarUrl = (username: string) => {
        const teamName = usernameToTeamName[username] || username;
        if (!teamName) return `https://ui-avatars.com/api/?name=?&background=0B132B&color=F5A623&font-size=0.5&bold=true`;
        return `/api/drive-images?type=team&name=${encodeURIComponent(teamName)}`;
    }
    
    const fallbackAvatar = (username: string) => {
        const teamName = usernameToTeamName[username] || username;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=0B132B&color=F5A623&font-size=0.5&bold=true`;
    }

    return (
        <div className="bg-[#0B132B]/60 p-4 sm:p-5 rounded-xl border border-slate-700 w-full max-w-2xl mx-auto shadow-lg h-[300px]">
            {/* Race Info Header */}
            {match.race_info && (
                <div className="pb-3 mb-3 border-b border-slate-700 text-center">
                    <p className="font-bold text-base text-slate-100">{match.race_info.meeting_name}</p>
                    <p className="font-semibold text-sm text-amber-500">{translateSessionName(match.race_info.session_name)}</p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 mt-2">
                        <MapPin className="h-3 w-3 text-[#F5A623]" />
                        <span>{match.race_info.circuit_short_name}</span>
                        <span className="text-slate-600">&bull;</span>
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(match.race_info.date_start).toLocaleDateString('it-IT', { day: '2-digit', month: 'long' })}</span>
                    </div>
                </div>
            )}
            
            {/* Player Info */}
            <div className="grid grid-cols-3 items-center text-center">
                {/* User A */}
                <div className="flex flex-col items-center space-y-2">
                    <div className="relative w-14 h-14 sm:w-20 sm:h-20">
                        <Image 
                            src={getAvatarUrl(userA?.username)} 
                            alt={userA?.username || 'User A'}
                            fill
                            sizes="(max-width: 640px) 56px, 80px"
                            className="rounded-full border-2 border-slate-600 object-cover bg-slate-800 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                            onError={(e) => { (e.target as HTMLImageElement).src = fallbackAvatar(userA?.username || 'A'); }}
                        />
                    </div>
                    <span className="font-bold text-sm sm:text-lg text-white w-full truncate px-1">{usernameToTeamName[userA?.username] || userA?.username}</span>
                </div>

                {/* VS Separator */}
                <div className="flex flex-col items-center">
                     <Swords className="h-8 sm:h-10 w-8 sm:w-10 text-[#F5A623] mb-2" />
                     <span className="text-xs sm:text-sm text-slate-400">{match.round}</span>
                </div>
               
                {/* User B */}
                <div className="flex flex-col items-center space-y-2">
                    <div className="relative w-14 h-14 sm:w-20 sm:h-20">
                        <Image 
                            src={getAvatarUrl(userB?.username)} 
                            alt={userB?.username || 'User B'}
                            fill
                            sizes="(max-width: 640px) 56px, 80px"
                            className="rounded-full border-2 border-slate-600 object-cover bg-slate-800 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                            onError={(e) => { (e.target as HTMLImageElement).src = fallbackAvatar(userB?.username || 'B'); }}
                        />
                    </div>
                    <span className="font-bold text-sm sm:text-lg text-white w-full truncate px-1">{usernameToTeamName[userB?.username] || userB?.username}</span>
                </div>
            </div>
        </div>
    );
};


const ProssimiScontriBanner = ({ matches, participants, usernameToTeamName }: { matches: any[]; participants: any[], usernameToTeamName: Record<string, string> }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. Filter for scheduled matches that are not BYEs and have race info
  const scheduledMatches = matches.filter((m) => {
    return m.status === 'SCHEDULED' && !m.user_a_id.includes('BYE') && !m.user_b_id.includes('BYE') && m.race_info;
  });

  let upcomingMatches: any[] = [];
  if (scheduledMatches.length > 0) {
      // 2. Sort all scheduled matches by date to find the next upcoming round
      scheduledMatches.sort((a, b) => new Date(a.race_info.date_start).getTime() - new Date(b.race_info.date_start).getTime());

      // 3. Find the session key of the very first upcoming match
      const nextSessionKey = scheduledMatches[0].race_info.session_key;

      // 4. Filter to get all matches belonging to that same upcoming session
      upcomingMatches = scheduledMatches.filter(m => m.race_info.session_key === nextSessionKey);
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? upcomingMatches.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === upcomingMatches.length - 1 ? 0 : prevIndex + 1));
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  return (
    <div className="bg-[#1C2541]/50 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-lg mb-8 animate-fade-in">
        <div className="p-4 border-b border-slate-700/50 flex items-center space-x-3">
            <CalendarClock className="h-6 w-6 text-[#F5A623]" />
            <h2 className="text-xl font-black tracking-wider text-white uppercase">Prossimi Scontri</h2>
        </div>

        {upcomingMatches.length === 0 ? (
            <p className="text-slate-300 text-center p-10">Non ci sono scontri in programma al momento.</p>
        ) : (
            <div className='p-4'>
                {/* Carousel of Matches */}
                <div {...swipeHandlers} className="relative group flex items-center justify-center py-2 sm:py-4">
                     {upcomingMatches.length > 1 && (
                        <button 
                            onClick={handlePrev} 
                            className="absolute left-2 sm:left-0 sm:-translate-x-full bg-slate-800/50 hover:bg-slate-700/70 p-2 rounded-full transition-all z-10 opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft className="h-6 w-6 text-white" />
                        </button>
                    )}

                    {upcomingMatches.map((match, index) => (
                        <div
                            key={match.id}
                            className={`w-full transition-opacity duration-300 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                            style={{ display: index === currentIndex ? 'block' : 'none' }}
                        >
                            <UpcomingMatchCard match={match} participants={participants} usernameToTeamName={usernameToTeamName} />
                        </div>
                    ))}

                    {upcomingMatches.length > 1 && (
                        <button 
                            onClick={handleNext} 
                            className="absolute right-2 sm:right-0 sm:translate-x-full bg-slate-800/50 hover:bg-slate-700/70 p-2 rounded-full transition-all z-10 opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight className="h-6 w-6 text-white" />
                        </button>
                    )}
                </div>
                
                {/* Dot Indicators */}
                {upcomingMatches.length > 1 && (
                    <div className="flex justify-center space-x-2 mt-4">
                        {upcomingMatches.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-amber-500 w-4' : 'bg-slate-600 hover:bg-slate-500'}`}
                                aria-label={`Go to match ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default ProssimiScontriBanner;
