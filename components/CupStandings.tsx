import React from 'react';
import Image from 'next/image';

interface StandingsProps {
  groupId: string;
  standings: {
    username: string;
    points: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
  }[];
}

export const CupStandings: React.FC<StandingsProps> = ({ standings, groupId }) => {
  return (
    <div className="bg-[#1C2541] rounded-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-[#F5A623]/30 overflow-hidden relative">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#F5A623] z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#F5A623] z-10 pointer-events-none"></div>
      
      <div className="px-4 py-3 sm:px-6 sm:py-4 bg-[#0B132B] border-b border-[#F5A623]/30 relative z-10">
        <h3 className="text-[#F5A623] font-black tracking-widest text-sm uppercase">{groupId}</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-[10px] sm:text-xs text-slate-400 uppercase bg-[#1C2541] border-b border-slate-700/50 tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-3 font-black">Squadra</th>
              <th scope="col" className="px-2 py-3 text-center font-black">PTS</th>
              <th scope="col" className="px-2 py-3 text-center font-black">G</th>
              <th scope="col" className="px-2 py-3 text-center font-black">V</th>
              <th scope="col" className="px-2 py-3 text-center font-black">N</th>
              <th scope="col" className="px-2 py-3 text-center font-black">P</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, idx) => {
              const logoUrl = `/api/drive-images?type=team&name=${encodeURIComponent(row.username)}`;
              return (
                <tr key={row.username} className="bg-[#1C2541] border-b border-[#F5A623]/10 hover:bg-[#2A365C] transition-colors group">
                  <td className="px-4 py-3 sm:py-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden border-2 border-[#F5A623]/50 bg-[#0B132B] shadow-[0_0_10px_rgba(245,166,35,0.2)]">
                        <Image 
                          src={logoUrl} 
                          alt={row.username} 
                          fill
                          sizes="40px"
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex flex-col min-w-0 justify-center">
                        <span className="text-sm font-bold text-white tracking-wide group-hover:text-[#F5A623] transition-colors line-clamp-2 break-words">
                          {row.username}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center font-mono font-black text-[#F5A623] text-base">{row.points}</td>
                  <td className="px-2 py-3 text-center font-medium text-slate-300">{row.played}</td>
                  <td className="px-2 py-3 text-center font-medium text-green-400">{row.won}</td>
                  <td className="px-2 py-3 text-center font-medium text-yellow-400">{row.drawn}</td>
                  <td className="px-2 py-3 text-center font-medium text-red-400">{row.lost}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
