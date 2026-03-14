import React from 'react';
import BracketPreview from './BracketPreview';
import { Bracket } from '@/lib/types';
import { generateBracket } from '@/lib/utils';

const Tabellone = ({ cup }: { cup: any }) => {

  // TODO: The bracket should be stored in the cup data, not generated on the fly
  const bracket = generateBracket(cup.participants, cup.settings);

  return (
    <div className="bg-[#1C2541] border border-[#F5A623]/20 shadow-lg rounded-none">
      <div className="p-4 border-b border-[#F5A623]/20">
        <h3 className="font-bold text-lg text-[#F5A623] tracking-wider uppercase">Tabellone</h3>
      </div>
      <div className="p-4">
        {bracket ? (
          <BracketPreview bracket={bracket} />
        ) : (
          <p className="text-slate-400 text-center py-4">Il tabellone non è ancora stato generato.</p>
        )}
      </div>
    </div>
  );
};

export default Tabellone;
