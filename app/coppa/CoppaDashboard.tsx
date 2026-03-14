'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { notFound } from 'next/navigation';
import { Loader, Users, Swords, Calendar, ChevronLeft, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { clsx } from 'clsx';
import Classifica from './Classifica';
import Tabellone from './Tabellone';
import ProssimiScontriBanner from './ProssimiScontriBanner';
import { getCustomTeamInfo } from '@/lib/teams';
import DateChangeBanner from './DateChangeBanner';

interface CoppaDashboardProps {
    coppaId: string;
    initialData?: any | null;
    onBack: () => void;
    onEdit: () => void;
}

const CoppaDashboard = ({ coppaId, initialData, onBack, onEdit }: CoppaDashboardProps) => {
  const [cup, setCup] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tabellone' | 'classifica'>('tabellone');

  const backgroundUrl = cup ? `/api/drive-images?type=cup&name=${cup.name}_background` : '';

  const cupGroups = useMemo(() => {
    if (!cup || !cup.matches) return {};
    
    const groups: Record<string, Set<string>> = {};
    
    cup.matches
        .filter((m: any) => m.round.startsWith('Girone'))
        .forEach((m: any) => {
            const groupName = m.round.split(' - ')[0];
            if (!groups[groupName]) {
                groups[groupName] = new Set();
            }
            if(m.user_a_id !== 'BYE') groups[groupName].add(m.user_a_id);
            if(m.user_b_id !== 'BYE') groups[groupName].add(m.user_b_id);
        });
        
    return Object.keys(groups).reduce((acc: Record<string, string[]>, groupName) => {
        acc[groupName] = Array.from(groups[groupName]);
        return acc;
    }, {});
  }, [cup]);

  useEffect(() => {
    const fetchCupData = async (force = false) => {
        if (coppaId) {
            try {
                if (!initialData || force) setLoading(true);
                const response = await fetch(`/api/coppa?id=${coppaId}`);
                if (response.status === 404) {
                    notFound();
                    return;
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Errore nel caricamento dei dati della coppa');
                }
                const data = await response.json();
                setCup(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    if (!initialData) {
        fetchCupData();
    }
  }, [coppaId, initialData]);

  const handleDismissBanner = async () => {
    if (!cup) return;
    try {
        const response = await fetch('/api/coppa/dismiss-banner', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cupId: cup.id }),
        });
        if (!response.ok) {
            throw new Error('Failed to dismiss banner');
        }
        // Optimistically update the UI
        setCup((prevCup: any) => ({
            ...prevCup,
            dateChangeInfo: {
                ...prevCup.dateChangeInfo,
                showDateChangeBanner: false,
            },
        }));
    } catch (err) {
        console.error(err);
        // Optionally show an error to the user
    }
  };

  const usernameToTeamName = useMemo(() => (cup?.participants || []).reduce((acc: Record<string, string>, p: any) => {
    const customInfo = getCustomTeamInfo(p.username);
    if (customInfo) {
      acc[p.username] = customInfo.name;
    } else {
      acc[p.username] = p.username;
    }
    return acc;
  }, {}), [cup?.participants]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-[#0B132B]">
        <Loader className="h-16 w-16 text-[#F5A623] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20 bg-[#0B132B]">
          <div className="text-center py-20 px-6 bg-red-900/20 border-2 border-red-500/50 rounded-lg">
            <h3 className="text-2xl font-bold text-red-400">Errore</h3>
            <p className="text-red-300 mt-2">{error}</p>
            <button onClick={onBack} className="mt-6 inline-block bg-[#F5A623] text-white font-bold px-6 py-2 rounded-md hover:bg-opacity-90 transition-opacity">
                Torna alle Coppe
            </button>
        </div>
      </div>
    );
  }

  if (!cup) {
    // This can happen if the fetch returns nothing but not a 404
    notFound();
    return null;
  }

  return (
    <div className="relative">
        {/* Background Image */}
        <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
                backgroundImage: `url('${backgroundUrl}')`,
                backgroundColor: '#0B132B',
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60"></div>
        </div>


        <div className="relative container mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in text-white">
            
            {cup.dateChangeInfo && cup.dateChangeInfo.showDateChangeBanner && (
                <DateChangeBanner
                    dateChangeInfo={cup.dateChangeInfo}
                    onDismiss={handleDismissBanner}
                />
            )}

            {/* Header */}
            <div className="mb-8">
                <button onClick={onBack} className="flex items-center space-x-1 text-slate-300 hover:text-[#F5A623] transition-colors mb-4 group w-fit px-2 py-1 -ml-2 rounded-md hover:bg-white/5">
                    <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold tracking-wide text-sm sm:text-base">TORNA A TUTTE LE COPPE</span>
                </button>
                <div className="bg-[#1C2541]/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-xl">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                        <Image
                            src={cup.imageUrl}
                            alt={`Logo ${cup.name}`}
                            fill
                            sizes="(max-width: 640px) 80px, 96px"
                            className="object-contain rounded-full border-2 border-[#F5A623]/50 shadow-[0_0_15px_rgba(245,166,35,0.2)]"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://img.icons8.com/plasticine/100/trophy.png'; }}
                        />
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#F5A623] uppercase tracking-wider drop-shadow-md">{cup.name}</h1>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-2 text-slate-300 mt-2 text-xs sm:text-sm font-medium">
                            <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4" />
                                <span>{cup.participants.length} Partecipanti</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Swords className="h-4 w-4" />
                                <span>{cup.matches.length} Match</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(cup.creationDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <button onClick={onEdit} className="p-3 bg-slate-800/50 rounded-full text-slate-300 hover:text-[#F5A623] hover:bg-slate-700/70 transition-colors" title="Impostazioni Coppa">
                            <Settings className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            <ProssimiScontriBanner matches={cup.matches} participants={cup.participants} usernameToTeamName={usernameToTeamName} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Mobile Tabs */}
                <div className="lg:hidden col-span-1 sticky top-0 z-30 bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-700/50 -mx-4 px-4 pt-2">
                    <div className="flex space-x-1 p-1 bg-slate-800/50 rounded-lg">
                        <button
                            onClick={() => setActiveTab('tabellone')}
                            className={clsx("flex-1 py-2.5 text-sm font-bold uppercase tracking-wider rounded-md transition-all duration-300", activeTab === 'tabellone' ? 'bg-[#F5A623] text-[#0B132B] shadow-lg' : 'text-slate-400 hover:text-slate-200')}
                        >
                            Tabellone
                        </button>
                        <button
                            onClick={() => setActiveTab('classifica')}
                            className={clsx("flex-1 py-2.5 text-sm font-bold uppercase tracking-wider rounded-md transition-all duration-300", activeTab === 'classifica' ? 'bg-[#F5A623] text-[#0B132B] shadow-lg' : 'text-slate-400 hover:text-slate-200')}
                        >
                            Classifica
                        </button>
                    </div>
                </div>

                <div className={clsx("lg:col-span-2", activeTab === 'tabellone' ? 'block animate-fade-in' : 'hidden lg:block')}>
                    <Tabellone cup={cup} participants={cup.participants} usernameToTeamName={usernameToTeamName} />
                </div>
                <div className={clsx(activeTab === 'classifica' ? 'block animate-fade-in' : 'hidden lg:block')}>
                    <Classifica participants={cup.participants} usernameToTeamName={usernameToTeamName} groups={cupGroups} numQualifiers={cup.settings?.numQualifiers} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default CoppaDashboard;
