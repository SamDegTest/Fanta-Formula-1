import React, { useState, useMemo } from 'react';
import { ListOrdered, Shield, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

const LeaderboardTable = ({ rankedParticipants, usernameToTeamName, numQualifiers = 0, qualifiedUsernames }: { rankedParticipants: any[], usernameToTeamName: Record<string, string>, numQualifiers?: number, qualifiedUsernames?: Set<string> }) => {
  if (rankedParticipants.length === 0) return <p className="text-slate-400 text-center py-6">Nessun partecipante in questa classifica.</p>;

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
    <ul className="space-y-2">
      {rankedParticipants.map((p, index) => {
        const isQualified = qualifiedUsernames ? qualifiedUsernames.has(p.username) : (numQualifiers > 0 && index < numQualifiers);
        const isCutoff = !qualifiedUsernames && numQualifiers > 0 && index === numQualifiers - 1 && index < rankedParticipants.length - 1;

        return (
          <React.Fragment key={p.username}>
            <li className={`relative flex items-center justify-between p-2.5 rounded-lg border transition-all ${isQualified ? 'bg-[#0B132B]/80 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-[#0B132B]/50 border-slate-700/70 opacity-80'}`}>
              {isQualified && (
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-lg shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
              )}
              <div className="flex items-center gap-3">
                <span className={`text-base font-black w-6 text-center ${isQualified ? 'text-green-400' : (index < 3 ? 'text-[#F5A623]' : 'text-slate-400')}`}>
                  {index + 1}
                </span>
                <div className="relative w-9 h-9">
                  <Image 
                    src={getAvatarUrl(p.username)} 
                    alt={p.username} 
                    fill
                    sizes="36px"
                    className={`rounded-full object-cover bg-slate-800 border-2 ${isQualified ? 'border-green-500/50' : 'border-slate-600'}`}
                    onError={(e) => { (e.target as HTMLImageElement).src = fallbackAvatar(p.username || '?'); }}
                  />
                </div>
                <span className={`font-semibold text-sm ${isQualified ? 'text-white' : 'text-slate-300'}`}>{usernameToTeamName[p.username] || p.username}</span>
              </div>
              <div className="flex items-center gap-3">
                {isQualified && <span className="text-[10px] font-bold text-green-500 bg-green-900/30 px-1.5 py-0.5 rounded border border-green-500/30 uppercase tracking-wider hidden sm:inline-block">Qualificato</span>}
                <span className={`font-black text-lg tracking-wider pr-2 ${isQualified ? 'text-green-400' : 'text-white'}`}>{p.score || 0}</span>
              </div>
            </li>
            {isCutoff && (
                <div className="flex items-center gap-2 py-1 px-2 opacity-60">
                    <div className="h-px bg-slate-600/50 flex-1 border-t border-dashed border-slate-500"></div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Zona Eliminazione</span>
                    <div className="h-px bg-slate-600/50 flex-1 border-t border-dashed border-slate-500"></div>
                </div>
            )}
          </React.Fragment>
        );
      })}
    </ul>
  );
};

const Classifica = ({ participants, usernameToTeamName, groups, numQualifiers }: { participants: any[], usernameToTeamName: Record<string, string>, groups: Record<string, string[]>, numQualifiers?: number }) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const hasGroups = groups && Object.keys(groups).length > 0;
  const sortedGroupNames = hasGroups ? Object.keys(groups).sort() : [];

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const getGroupParticipants = (groupName: string) => {
    const groupUsernames = groups[groupName] || [];
    return participants
        .filter(p => groupUsernames.includes(p.username))
        .sort((a, b) => (b.score || 0) - (a.score || 0));
  };

  const allParticipantsSorted = [...participants].sort((a, b) => (b.score || 0) - (a.score || 0));

  // Calcola chi sta effettivamente passando il turno nei gironi per evidenziarli nella classifica globale
  const qualifiedUsernames = useMemo(() => {
    if (!hasGroups || !numQualifiers) return undefined;
    
    const set = new Set<string>();
    Object.keys(groups).forEach(groupName => {
       const groupUsernames = groups[groupName] || [];
       const groupParticipants = participants
        .filter(p => groupUsernames.includes(p.username))
        .sort((a, b) => (b.score || 0) - (a.score || 0));
        
       groupParticipants.slice(0, numQualifiers).forEach(p => set.add(p.username));
    });
    return set;
  }, [groups, participants, numQualifiers, hasGroups]);

  return (
    <div className="bg-[#1C2541]/50 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-lg">
      <div className="p-4 border-b border-slate-700/50 flex items-center space-x-3">
        <ListOrdered className="h-6 w-6 text-[#F5A623]" />
        <h3 className="font-black text-xl text-white tracking-wider uppercase">Classifica</h3>
      </div>
      <div className="p-2 sm:p-4 space-y-2">
        {hasGroups ? (
          <>
            {sortedGroupNames.map(groupName => {
              const isOpen = openAccordion === groupName;
              return (
                <div key={groupName} className="bg-[#0B132B]/40 border border-slate-700/50 rounded-lg overflow-hidden">
                  <button onClick={() => toggleAccordion(groupName)} className="w-full flex items-center justify-between p-3 hover:bg-[#0B132B]/60 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Shield className={`h-5 w-5 ${isOpen ? 'text-[#F5A623]' : 'text-slate-400 group-hover:text-[#F5A623]'}`} />
                      <span className={`font-bold text-base tracking-wide uppercase ${isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>Classifica {groupName}</span>
                    </div>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-[#F5A623]" /> : <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-[#F5A623]" />}
                  </button>
                  {isOpen && (
                    <div className="p-3 border-t border-slate-700/50 animate-fade-in">
                      <LeaderboardTable rankedParticipants={getGroupParticipants(groupName)} usernameToTeamName={usernameToTeamName} numQualifiers={numQualifiers} />
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Global Leaderboard Accordion */}
            <div className="bg-[#0B132B]/40 border border-slate-700/50 rounded-lg overflow-hidden">
              <button onClick={() => toggleAccordion('global')} className="w-full flex items-center justify-between p-3 hover:bg-[#0B132B]/60 transition-colors group">
                <div className="flex items-center gap-3">
                  <Globe className={`h-5 w-5 ${openAccordion === 'global' ? 'text-[#F5A623]' : 'text-slate-400 group-hover:text-[#F5A623]'}`} />
                  <span className={`font-bold text-base tracking-wide uppercase ${openAccordion === 'global' ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>Classifica Globale</span>
                </div>
                {openAccordion === 'global' ? <ChevronUp className="h-5 w-5 text-[#F5A623]" /> : <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-[#F5A623]" />}
              </button>
              {openAccordion === 'global' && (
                <div className="p-3 border-t border-slate-700/50 animate-fade-in">
                  <LeaderboardTable rankedParticipants={allParticipantsSorted} usernameToTeamName={usernameToTeamName} qualifiedUsernames={qualifiedUsernames} />
                </div>
              )}
            </div>
          </>
        ) : (
          // Fallback to simple global leaderboard if no groups
          <div className="p-2">
            <LeaderboardTable rankedParticipants={allParticipantsSorted} usernameToTeamName={usernameToTeamName} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Classifica;
