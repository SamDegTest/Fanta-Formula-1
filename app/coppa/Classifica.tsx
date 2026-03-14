import React from 'react';

const Classifica = ({ participants }: { participants: any[] }) => {
  // TODO: Implement actual standings logic
  const sortedParticipants = [...participants].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="bg-[#1C2541] border border-[#F5A623]/20 shadow-lg rounded-none">
      <div className="p-4 border-b border-[#F5A623]/20">
        <h3 className="font-bold text-lg text-[#F5A623] tracking-wider uppercase">Classifica</h3>
      </div>
      <div className="p-4 space-y-3">
        {sortedParticipants.length > 0 ? (
          <ul className="divide-y divide-slate-700">
            {sortedParticipants.map((p, index) => (
              <li key={p.username} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <span className="text-sm font-bold text-slate-400 w-6 text-center">{index + 1}</span>
                  <span className="text-white ml-3">{p.username}</span>
                </div>
                <span className="font-black text-white">{p.score || 0}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400 text-center py-4">La classifica non è ancora disponibile.</p>
        )}
      </div>
    </div>
  );
};

export default Classifica;
