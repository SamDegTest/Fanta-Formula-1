'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, Settings, ChevronRight, TrendingUp, TrendingDown, Minus, RefreshCw, Bot, Zap, Shield, Shuffle, Infinity, Wrench, PieChart, ArrowRightLeft, Navigation } from 'lucide-react';

// --- CONFIGURAZIONE SQUADRE STATICHE ---
// Aggiungi qui le associazioni tra nome utente e nome/logo squadra personalizzato.
// La chiave deve essere parte del nome utente o nome reale (tutto in minuscolo).
const CUSTOM_TEAMS: Record<string, { name: string, logo?: string, boosters?: Record<string, number> }> = {
  "federico russo": {
    name: "AvvocatoSenior F1 team",
  },
  "domenico ghionda": {
    name: "Habibi motorsport F1 team",
  },
  "raul sisto": {
    name: "Legione del centauro",
  },
  "elena russo": {
    name: "Nenacrochet",
  },
  "gianluca tunzi": {
    name: "Tunzi Hyperflux Racing",
  },
  "Vittorio Sisto":{
    name: "Beavers"
  },
  "Luca Siciliani":{
    name: "Scuderia Sbinnati"
  },
  "Valerio Maniscalco":{
    name: "Speed and Power"
  },
  "Christian Busco":{
    name: "Dinoco F1 team"
  }
};

const BOOSTER_TYPES = [
  { id: 'limitless', name: 'Limitless', icon: Infinity, color: 'text-blue-500', bg: 'bg-blue-500/20', border: 'border-blue-500/50' },
  { id: 'wildcard', name: 'Wildcard', icon: Shuffle, color: 'text-red-600', bg: 'bg-red-600/20', border: 'border-red-600/50' },
  { id: 'final_fix', name: 'Final Fix', icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500/50' },
  { id: 'autopilot', name: 'Auto Pilot', icon: Bot, color: 'text-teal-500', bg: 'bg-teal-500/20', border: 'border-teal-500/50' },
  { id: 'no_negative', name: 'No Negative', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/20', border: 'border-purple-500/50' },
  { id: 'extra_drs', name: 'x3 Boost', icon: Zap, color: 'text-green-500', bg: 'bg-green-500/20', border: 'border-green-500/50' }
];

const getCustomTeamInfo = (username?: string, name?: string) => {
  const searchStr = `${username || ''} ${name || ''}`.toLowerCase();
  
  for (const [key, info] of Object.entries(CUSTOM_TEAMS)) {
    if (searchStr.includes(key.toLowerCase())) {
      return info;
    }
  }
  return null;
};
// ---------------------------------------

// Helper per ottenere il codice nazione per le bandiere
const getCountryCode = (country: string): string => {
  const map: Record<string, string> = {
    'Bahrain': 'bh',
    'Saudi Arabia': 'sa',
    'Australia': 'au',
    'Japan': 'jp',
    'China': 'cn',
    'USA': 'us',
    'United States': 'us',
    'Miami': 'us',
    'Italy': 'it',
    'Monaco': 'mc',
    'Canada': 'ca',
    'Spain': 'es',
    'Austria': 'at',
    'UK': 'gb',
    'Great Britain': 'gb',
    'Hungary': 'hu',
    'Belgium': 'be',
    'Netherlands': 'nl',
    'Singapore': 'sg',
    'Azerbaijan': 'az',
    'Qatar': 'qa',
    'Mexico': 'mx',
    'Brazil': 'br',
    'UAE': 'ae',
    'Abu Dhabi': 'ae'
  };
  return map[country] || 'un';
};

export default function FantaF1Dashboard() {
  const [activeTab, setActiveTab] = useState<'generale' | 'coppa' | 'calendario'>('generale');
  
  // API States
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [syncResult, setSyncResult] = useState<any>(null);
  const [realStandings, setRealStandings] = useState<any[]>([]);
  
  // Calendar States
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [calendarStatus, setCalendarStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Settings State
  // const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Disattivato

  const handleSync = async (forceRefresh: boolean = false) => {
    setSyncStatus('loading');
    setSyncResult(null);

    // Se forziamo il refresh, puliamo la cache e resettiamo la vista
    if (forceRefresh) {
      localStorage.removeItem('f1_fantasy_standings');
      setRealStandings([]);
    }

    // Carica i dati dalla cache se disponibili all'inizio per evitare flash di vuoto
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem('f1_fantasy_standings');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.aggregated) {
            setRealStandings(parsed.aggregated);
            // Se abbiamo dati in cache, li mostriamo subito come "success" temporaneo
            // ma continuiamo il caricamento in background
            setSyncResult({ 
              leagueName: parsed.leagueName,
              isCached: true,
              lastUpdated: parsed.lastUpdated
            });
          }
        }
      } catch (e) {
        console.error("Errore lettura cache classifica", e);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch('/api/f1-fantasy', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la sincronizzazione');
      }
      
      setSyncStatus('success');
      setSyncResult(data);
      if (data.aggregated && data.aggregated.length > 0) {
        setRealStandings([...data.aggregated]);
        // Salva in cache con timestamp
        localStorage.setItem('f1_fantasy_standings', JSON.stringify({
          aggregated: data.aggregated,
          leagueName: data.leagueName,
          lastUpdated: new Date().toISOString()
        }));
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      const cached = localStorage.getItem('f1_fantasy_standings');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setRealStandings(parsed.aggregated);
          setSyncStatus('success');
          setSyncResult({ 
            note: "Impossibile aggiornare i dati. Mostro gli ultimi dati salvati.",
            error: err.message,
            aggregated: parsed.aggregated,
            leagueName: parsed.leagueName,
            lastUpdated: parsed.lastUpdated,
            isOffline: true
          });
          return;
        } catch (e) {}
      }

      setSyncStatus('error');
      setSyncResult({ error: err.message });
    }
  };

  // Carica i dati all'avvio
  useEffect(() => {
    handleSync();
  }, []);

  const fetchCalendar = async () => {
    setCalendarStatus('loading');
    
    let hasCachedData = false;
    // Carica i dati dalla cache se disponibili
    try {
      const cachedCalendar = localStorage.getItem('f1_calendar_cache');
      if (cachedCalendar) {
        setCalendarData(JSON.parse(cachedCalendar));
        hasCachedData = true;
      }
    } catch (e) {
      console.error("Errore lettura cache calendario", e);
    }

    try {
      const res = await fetch('https://api.jolpi.ca/ergast/f1/current.json');
      if (!res.ok) throw new Error('Errore nel recupero del calendario');
      const data = await res.json();
      setCalendarData(data.MRData.RaceTable.Races);
      localStorage.setItem('f1_calendar_cache', JSON.stringify(data.MRData.RaceTable.Races));
      setCalendarStatus('success');
    } catch (err) {
      console.error(err);
      if (hasCachedData) {
        setCalendarStatus('success'); // Se abbiamo i dati in cache, mostriamoli comunque
      } else {
        setCalendarStatus('error');
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'calendario' && calendarData.length === 0) {
      fetchCalendar();
    }
  }, [activeTab]);

  // Dati mock per la classifica a gironi (da sostituire poi)
  const groupStandings = [
    { pos: 1, name: "Mario Rossi", pti: 9, g: 3, v: 3, n: 0, p: 0, pf: 450.5, ps: 410.0 },
    { pos: 2, name: "Luigi Verdi", pti: 4, g: 3, v: 1, n: 1, p: 1, pf: 420.0, ps: 425.0 },
    { pos: 3, name: "Giovanni Neri", pti: 2, g: 3, v: 0, n: 2, p: 1, pf: 415.5, ps: 430.0 },
    { pos: 4, name: "Paolo Bianchi", pti: 1, g: 3, v: 0, n: 1, p: 2, pf: 400.0, ps: 421.0 },
  ];

  const recentMatches = [
    { userA: "Mario Rossi", scoreA: 155.5, userB: "Luigi Verdi", scoreB: 148.0, threshold: 5, resultA: 3, resultB: 0 },
    { userA: "Giovanni Neri", scoreA: 140.0, userB: "Paolo Bianchi", scoreB: 142.5, threshold: 5, resultA: 1, resultB: 1 },
  ];

  return (
    <div className="min-h-screen bg-[#0B132B] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1C2541] via-[#0B132B] to-[#050A1F] text-slate-100 font-sans selection:bg-[#F5A623] selection:text-[#0B132B] relative">
      {/* Background ambient lights */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#F5A623]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-[30rem] h-[30rem] bg-[#F5A623]/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Header (Desktop) */}
      <header className="bg-[#050A1F]/80 backdrop-blur-md border-b-2 border-[#F5A623] shadow-[0_4px_20px_rgba(245,166,35,0.15)] relative z-10 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <nav className="flex space-x-8">
              <button 
                onClick={() => setActiveTab('generale')}
                className={`font-bold tracking-wide flex items-center space-x-2 pb-2 transition-all ${activeTab === 'generale' ? 'text-[#F5A623] border-b-2 border-[#F5A623]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Users className="h-5 w-5" />
                <span>CLASSIFICA GENERALE</span>
              </button>
              <button 
                disabled
                className="font-bold tracking-wide flex items-center space-x-2 pb-2 transition-all text-slate-600 cursor-not-allowed relative group"
                title="Funzionalità in arrivo"
              >
                <Trophy className="h-5 w-5 opacity-50" />
                <span className="opacity-50">COPPA</span>
                <span className="absolute -top-3 -right-6 bg-[#F5A623]/20 text-[#F5A623] text-[8px] px-1.5 py-0.5 rounded-sm border border-[#F5A623]/30 tracking-widest">PRESTO</span>
              </button>
              <button 
                onClick={() => setActiveTab('calendario')}
                className={`font-bold tracking-wide flex items-center space-x-2 pb-2 transition-all ${activeTab === 'calendario' ? 'text-[#F5A623] border-b-2 border-[#F5A623]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Calendar className="h-5 w-5" />
                <span>CALENDARIO</span>
              </button>
            </nav>
            <button 
              disabled
              className="p-2 text-slate-600 cursor-not-allowed transition-colors"
              title="Impostazioni disattivate"
            >
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Header (Mobile) */}
      <header className="md:hidden bg-[#050A1F]/80 backdrop-blur-md border-b border-[#F5A623]/50 relative z-10">
        <div className="px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-black text-[#F5A623] tracking-widest uppercase truncate max-w-[80%]">
            {syncResult?.leagueName || 'PISTON LEAGUE'}
          </h1>
          <button 
            disabled
            className="p-2 text-slate-600 cursor-not-allowed transition-colors"
            title="Impostazioni disattivate"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 pb-24 md:pb-12 relative z-10">
        {activeTab === 'coppa' ? (
          <>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-[#F5A623] tracking-wider drop-shadow-sm">COPPA DI LEGA 2024</h2>
                <p className="text-sm text-slate-400 mt-1 uppercase tracking-wide">Soglia vittoria: 5 punti | Giornata attuale: GP 12 (Spa-Francorchamps)</p>
              </div>
              <div className="flex space-x-3">
                <select className="bg-[#1C2541] border border-[#F5A623]/30 text-[#F5A623] font-bold tracking-wide text-sm rounded-none focus:ring-[#F5A623] focus:border-[#F5A623] block p-2.5 shadow-[0_0_10px_rgba(245,166,35,0.1)] outline-none">
                  <option>GIRONE A</option>
                  <option>GIRONE B</option>
                  <option>GIRONE C</option>
                  <option>GIRONE D</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Classifica Girone */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#1C2541] rounded-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-[#F5A623]/30 overflow-hidden relative">
                  {/* Decorative corners */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#F5A623]"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#F5A623]"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#F5A623]"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#F5A623]"></div>
                  
                  <div className="px-6 py-4 border-b border-[#F5A623]/30 bg-[#0B132B] flex justify-between items-center">
                    <h3 className="text-lg font-black text-[#F5A623] tracking-widest">CLASSIFICA GIRONE A</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                      <thead className="text-[10px] sm:text-xs text-[#F5A623] uppercase bg-[#0B132B]/50 border-b border-[#F5A623]/30 tracking-wider">
                        <tr>
                          <th scope="col" className="px-2 py-3 sm:px-6 sm:py-4 w-8 sm:w-12 text-center font-black">Pos</th>
                          <th scope="col" className="px-2 py-3 sm:px-6 sm:py-4 font-black">Team / Utente</th>
                          <th scope="col" className="px-2 py-3 sm:px-4 sm:py-4 text-center font-black text-[#F5A623]">Pti</th>
                          <th scope="col" className="px-1 py-3 sm:px-3 sm:py-4 text-center font-black" title="Giocate">G</th>
                          <th scope="col" className="px-1 py-3 sm:px-3 sm:py-4 text-center font-black text-emerald-400" title="Vinte">V</th>
                          <th scope="col" className="px-1 py-3 sm:px-3 sm:py-4 text-center font-black text-[#F5A623]" title="Pareggiate">N</th>
                          <th scope="col" className="px-1 py-3 sm:px-3 sm:py-4 text-center font-black text-rose-400" title="Perse">P</th>
                          <th scope="col" className="px-2 py-3 sm:px-4 sm:py-4 text-right font-black" title="Punti Fatti">PF</th>
                          <th scope="col" className="px-2 py-3 sm:px-4 sm:py-4 text-right font-black" title="Punti Subiti">PS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupStandings.map((row, idx) => (
                          <tr key={idx} className="bg-[#1C2541] border-b border-[#F5A623]/10 hover:bg-[#2A365C] transition-colors group">
                            <td className="px-2 py-3 sm:px-6 sm:py-5 text-center font-medium">
                              {row.pos === 1 || row.pos === 2 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-[#F5A623] text-[#0B132B] text-xs sm:text-sm font-black shadow-[0_0_10px_rgba(245,166,35,0.4)]">
                                  {row.pos}
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-[#0B132B] text-slate-400 border border-slate-700 text-xs sm:text-sm font-black">
                                  {row.pos}
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-3 sm:px-6 sm:py-5 font-black text-white whitespace-nowrap tracking-wide group-hover:text-[#F5A623] transition-colors text-xs sm:text-sm">
                              {row.name}
                            </td>
                            <td className="px-2 py-3 sm:px-4 sm:py-5 text-center font-black text-[#F5A623] text-base sm:text-xl drop-shadow-sm">
                              {row.pti}
                            </td>
                            <td className="px-1 py-3 sm:px-3 sm:py-5 text-center font-bold text-xs sm:text-sm">{row.g}</td>
                            <td className="px-1 py-3 sm:px-3 sm:py-5 text-center font-bold text-emerald-400 text-xs sm:text-sm">{row.v}</td>
                            <td className="px-1 py-3 sm:px-3 sm:py-5 text-center font-bold text-[#F5A623] text-xs sm:text-sm">{row.n}</td>
                            <td className="px-1 py-3 sm:px-3 sm:py-5 text-center font-bold text-rose-400 text-xs sm:text-sm">{row.p}</td>
                            <td className="px-2 py-3 sm:px-4 sm:py-5 text-right font-mono font-bold text-slate-300 text-xs sm:text-sm">{row.pf.toFixed(1)}</td>
                            <td className="px-2 py-3 sm:px-4 sm:py-5 text-right font-mono font-bold text-slate-500 text-xs sm:text-sm">{row.ps.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-4 bg-[#0B132B] border-t border-[#F5A623]/30 text-xs text-slate-400 flex items-center space-x-4 font-bold tracking-wider uppercase">
                    <span className="flex items-center"><span className="w-3 h-3 bg-[#F5A623] mr-2 shadow-[0_0_5px_rgba(245,166,35,0.5)]"></span> QUALIFICATE ALLA FASE SUCCESSIVA</span>
                  </div>
                </div>
              </div>

              {/* Ultimi Risultati */}
              <div className="space-y-6">
                <div className="bg-[#1C2541] rounded-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-[#F5A623]/30 overflow-hidden relative">
                  {/* Decorative corners */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#F5A623]"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#F5A623]"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#F5A623]"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#F5A623]"></div>
                  
                  <div className="px-6 py-4 border-b border-[#F5A623]/30 bg-[#0B132B] flex justify-between items-center">
                    <h3 className="text-lg font-black text-[#F5A623] tracking-widest">GIORNATA 3 (GP 12)</h3>
                    <button className="text-[#F5A623] hover:text-white text-xs font-black tracking-wider flex items-center transition-colors">
                      VEDI TUTTE <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  <div className="divide-y divide-[#F5A623]/10">
                    {recentMatches.map((match, idx) => (
                      <div key={idx} className="p-4 sm:p-5 hover:bg-[#2A365C] transition-colors group">
                        <div className="flex justify-between items-center mb-3">
                          <span className={`font-black tracking-wide text-sm sm:text-base ${match.resultA === 3 ? 'text-[#F5A623]' : 'text-slate-300 group-hover:text-white'}`}>
                            {match.userA}
                          </span>
                          <span className="font-mono text-base sm:text-lg font-black bg-[#0B132B] text-[#F5A623] px-2 sm:px-3 py-1 border border-[#F5A623]/30 shadow-[0_0_10px_rgba(245,166,35,0.1)]">
                            {match.scoreA.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`font-black tracking-wide text-sm sm:text-base ${match.resultB === 3 ? 'text-[#F5A623]' : 'text-slate-300 group-hover:text-white'}`}>
                            {match.userB}
                          </span>
                          <span className="font-mono text-base sm:text-lg font-black bg-[#0B132B] text-[#F5A623] px-2 sm:px-3 py-1 border border-[#F5A623]/30 shadow-[0_0_10px_rgba(245,166,35,0.1)]">
                            {match.scoreB.toFixed(1)}
                          </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#F5A623]/10 flex justify-between items-center text-[10px] sm:text-xs uppercase tracking-wider">
                          <span className="text-slate-500 font-bold">
                            DIFF: {Math.abs(match.scoreA - match.scoreB).toFixed(1)} <span className="hidden sm:inline">(SOGLIA: {match.threshold})</span>
                          </span>
                          <span className={`font-black ${match.resultA === 3 || match.resultB === 3 ? 'text-[#F5A623]' : 'text-slate-400'}`}>
                            {match.resultA === 3 ? 'VITTORIA CASA' : match.resultB === 3 ? 'VITTORIA TRASFERTA' : 'PAREGGIO'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'calendario' ? (
          <>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-[#F5A623] tracking-wider drop-shadow-sm">CALENDARIO UFFICIALE F1</h2>
                  <p className="text-sm text-slate-400 mt-1 uppercase tracking-wide">Tutte le gare della stagione in corso</p>
                </div>
                <button 
                  onClick={fetchCalendar}
                  disabled={calendarStatus === 'loading'}
                  title="Sincronizza Calendario"
                  className="p-2 rounded-full text-slate-400 hover:text-[#F5A623] hover:bg-[#1C2541] transition-all disabled:opacity-50 group focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50 self-start mt-1"
                >
                  <RefreshCw className={`h-5 w-5 sm:h-6 sm:w-6 ${calendarStatus === 'loading' ? 'animate-spin text-[#F5A623]' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                </button>
              </div>
            </div>

            {calendarStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-none text-red-200 text-sm">
                <p className="font-bold mb-1 tracking-wide">ERRORE DI SINCRONIZZAZIONE</p>
                <p>Impossibile caricare il calendario ufficiale F1 in questo momento.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calendarStatus === 'loading' && calendarData.length === 0 ? (
                <div className="col-span-full py-16 text-center text-[#F5A623]">
                  <RefreshCw className="h-10 w-10 animate-spin mx-auto mb-4 opacity-80" />
                  <p className="font-bold tracking-widest animate-pulse">CARICAMENTO CALENDARIO...</p>
                </div>
              ) : calendarData.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-400 font-medium tracking-wide">
                  NESSUN DATO DISPONIBILE. CLICCA SU &quot;AGGIORNA&quot;.
                </div>
              ) : (
                calendarData.map((race, idx) => {
                  const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
                  const isPast = raceDate < new Date();
                  
                  return (
                    <div key={idx} className={`bg-[#1C2541] rounded-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] border ${isPast ? 'border-slate-700/50 opacity-70' : 'border-[#F5A623]/30'} overflow-hidden relative group hover:border-[#F5A623]/60 transition-colors`}>
                      {/* Decorative corners */}
                      <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${isPast ? 'border-slate-600' : 'border-[#F5A623]'}`}></div>
                      <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${isPast ? 'border-slate-600' : 'border-[#F5A623]'}`}></div>
                      <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${isPast ? 'border-slate-600' : 'border-[#F5A623]'}`}></div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${isPast ? 'border-slate-600' : 'border-[#F5A623]'}`}></div>
                      
                      <div className={`px-5 py-3 border-b ${isPast ? 'border-slate-700/50 bg-[#0B132B]/50' : 'border-[#F5A623]/30 bg-[#0B132B]'} flex justify-between items-center`}>
                        <div className="flex items-center gap-3">
                          <img 
                            src={`https://flagcdn.com/w40/${getCountryCode(race.Circuit.Location.country)}.png`}
                            srcSet={`https://flagcdn.com/w80/${getCountryCode(race.Circuit.Location.country)}.png 2x`}
                            alt={race.Circuit.Location.country}
                            className={`w-6 h-4 object-cover rounded-[2px] shadow-sm ${isPast ? 'opacity-50 grayscale' : ''}`}
                            loading="lazy"
                          />
                          <span className={`text-sm font-black tracking-widest ${isPast ? 'text-slate-500' : 'text-[#F5A623]'}`}>ROUND {race.round}</span>
                        </div>
                        {isPast && <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 border border-slate-700">COMPLETATO</span>}
                      </div>
                      
                      <div className="p-5">
                        <h3 className="text-xl font-black text-white tracking-wide mb-1 group-hover:text-[#F5A623] transition-colors">{race.raceName}</h3>
                        <p className="text-sm text-slate-400 font-medium mb-4">{race.Circuit.circuitName}</p>
                        
                        <div className="flex items-center space-x-3 text-slate-300">
                          <div className={`p-2 rounded-full ${isPast ? 'bg-slate-800 text-slate-500' : 'bg-[#0B132B] text-[#F5A623]'}`}>
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Gara</p>
                            <p className="font-mono font-bold text-lg">
                              {raceDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{race.Circuit.Location.locality}, {race.Circuit.Location.country}</span>
                          <a href={race.url} target="_blank" rel="noopener noreferrer" className={`text-xs font-black tracking-wider flex items-center ${isPast ? 'text-slate-500 hover:text-slate-300' : 'text-[#F5A623] hover:text-white'} transition-colors`}>
                            INFO <ChevronRight className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <>
            {syncResult?.isOffline && (
              <div className="mb-8 p-4 bg-blue-900/30 border border-blue-500/50 rounded-none text-blue-200 text-sm flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-full text-blue-950">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold uppercase tracking-wider">Modalità Offline / Cache</p>
                  <p className="opacity-80">Impossibile connettersi all&apos;API. Sto mostrando i dati salvati il {syncResult.lastUpdated ? new Date(syncResult.lastUpdated).toLocaleString('it-IT') : 'data sconosciuta'}.</p>
                </div>
              </div>
            )}

            {!syncResult?.aggregated && syncStatus === 'error' && (
              <div className="mb-8 p-6 bg-red-900/40 border-2 border-red-500 rounded-none shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500 rounded-full text-red-950">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-red-500 tracking-wider uppercase mb-1">Configurazione Richiesta</h3>
                    <p className="text-red-200/80 text-sm leading-relaxed">
                      L&apos;applicazione non ha dati salvati e non riesce a connettersi all&apos;API di F1. 
                      Assicurati che la variabile d&apos;ambiente <code className="bg-red-950/50 px-1.5 py-0.5 rounded border border-red-500/30">F1_API_COOKIE</code> sia configurata correttamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8 md:mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 flex items-center justify-center bg-[#1C2541] rounded-full border-2 border-[#F5A623]/50 overflow-hidden shadow-[0_0_25px_rgba(245,166,35,0.3)]">
                  <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-[#F5A623] absolute z-0" />
                  
                  <img 
                    src={`/api/drive-images?type=league&name=${encodeURIComponent(syncResult?.leagueName || 'PISTON LEAGUE')}`} 
                    alt="League Logo" 
                    className="h-full w-full object-cover relative z-10"
                    onError={(e) => {
                      // Se l'immagine della lega non viene trovata su Drive,
                      // nascondi l'elemento <img> per mostrare l'icona del trofeo sottostante.
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={(e) => {
                      e.currentTarget.style.display = 'block';
                    }}
                  />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#F5A623] tracking-wider drop-shadow-md uppercase max-w-full break-words">
                  {syncResult?.leagueName || 'PISTON LEAGUE'}
                </h2>
              </div>
            </div>

            {syncStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-none text-red-200 text-sm">
                <p className="font-bold mb-1 tracking-wide">ERRORE DI SINCRONIZZAZIONE</p>
                <p>{syncResult?.error}</p>
              </div>
            )}

            {syncResult?.note && (
              <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-none text-yellow-200/80 text-sm">
                <p className="font-bold mb-1 tracking-wide text-yellow-500">INFORMAZIONE</p>
                <p>{syncResult.note}</p>
              </div>
            )}

            <div className="bg-[#1C2541] rounded-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-[#F5A623]/30 overflow-hidden max-w-4xl mx-auto relative">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#F5A623] z-30 pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#F5A623] z-30 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#F5A623] z-30 pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#F5A623] z-30 pointer-events-none"></div>
              
              {/* Table Header with Refresh Button */}
              <div className="flex justify-between items-center px-4 py-3 sm:px-6 sm:py-4 bg-[#0B132B] border-b border-[#F5A623]/30 relative z-20">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-[#F5A623]" />
                  <h3 className="text-[#F5A623] font-black tracking-widest text-xs sm:text-sm uppercase">Classifica Generale</h3>
                </div>
                <button 
                  onClick={() => handleSync(true)}
                  disabled={syncStatus === 'loading'}
                  title="Sincronizza Classifica"
                  className="p-2 -mr-2 rounded-full text-slate-400 hover:text-[#F5A623] hover:bg-[#1C2541] transition-all disabled:opacity-50 group focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                >
                  <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${syncStatus === 'loading' ? 'animate-spin text-[#F5A623]' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                </button>
              </div>

              <div className="overflow-x-hidden sm:overflow-x-auto relative">
                <table className="w-full text-sm text-left text-slate-300 table-fixed sm:table-auto">
                  <thead className="text-[10px] sm:text-xs text-slate-400 uppercase bg-[#1C2541] border-b border-slate-700/50 tracking-wider sticky top-0 z-20">
                    <tr>
                      <th scope="col" className="px-1 py-3 sm:px-6 sm:py-5 w-12 sm:w-20 text-center font-black">Pos</th>
                      <th scope="col" className="px-2 py-3 sm:px-6 sm:py-5 font-black">Utente</th>
                      <th scope="col" className="px-1 py-3 sm:px-4 sm:py-5 hidden md:table-cell text-center font-black">Boosters</th>
                      <th scope="col" className="px-1 py-3 sm:px-6 sm:py-5 w-20 sm:w-32 text-center font-black">Punteggio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncStatus === 'loading' && realStandings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center text-[#F5A623]">
                          <RefreshCw className="h-10 w-10 animate-spin mx-auto mb-4 opacity-80" />
                          <p className="font-bold tracking-widest animate-pulse text-sm">CARICAMENTO CLASSIFICA...</p>
                        </td>
                      </tr>
                    ) : realStandings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center text-slate-400 font-medium tracking-wide text-sm">
                          NESSUN DATO DISPONIBILE. CLICCA SU &quot;AGGIORNA DATI&quot;.
                        </td>
                      </tr>
                    ) : (
                      realStandings.map((row, idx) => (
                        <tr key={idx} className="bg-[#1C2541] border-b border-[#F5A623]/10 hover:bg-[#2A365C] transition-colors group">
                          <td className="px-1 py-4 sm:px-6 sm:py-6 text-center font-medium">
                            <div className="flex items-center justify-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-sm sm:text-base transition-all duration-300 ${(row.rank || row.pos) === 1 ? 'bg-gradient-to-br from-[#F5A623] to-[#D35400] text-white shadow-[0_0_15px_rgba(245,166,35,0.4)] ring-2 ring-[#F5A623]/50' : (row.rank || row.pos) === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-[0_0_15px_rgba(203,213,225,0.3)] ring-2 ring-slate-300/50' : (row.rank || row.pos) === 3 ? 'bg-gradient-to-br from-[#CD7F32] to-[#8B4513] text-white shadow-[0_0_15px_rgba(205,127,50,0.3)] ring-2 ring-[#CD7F32]/50' : 'bg-[#0B132B]/50 text-slate-400 border border-slate-700/50 group-hover:border-slate-500/50 group-hover:text-slate-300'}`}>
                                {row.rank || row.pos}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-4 sm:px-6 sm:py-6 overflow-hidden">
                            <div className="flex items-center space-x-3">
                              {(() => {
                                const customInfo = getCustomTeamInfo(row.username, row.name);
                                const teamName = customInfo ? customInfo.name : (row.teams ? row.teams.map((t: any) => t.name).join(' & ') : row.name);
                                const logoUrl = `/api/drive-images?type=team&name=${encodeURIComponent(teamName)}`;
                                
                                return (
                                  <>
                                    <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border-2 border-[#F5A623]/50 bg-[#0B132B] shadow-[0_0_10px_rgba(245,166,35,0.2)]">
                                      <img 
                                        src={logoUrl} 
                                        alt={teamName} 
                                        className="h-full w-full object-cover" 
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                    <div className="flex flex-col min-w-0 w-full justify-center">
                                      <span className="text-sm sm:text-base font-bold text-white tracking-wide group-hover:text-[#F5A623] transition-colors line-clamp-2 break-words">
                                        {teamName}
                                      </span>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                            
                            {/* Boosters Mobile View (Sotto il nome su schermi piccoli) */}
                            <div className="md:hidden mt-3 flex flex-wrap gap-1.5 items-center">
                              {(() => {
                                const customInfo = getCustomTeamInfo(row.username, row.name);
                                const boosters = customInfo?.boosters || {};
                                
                                return BOOSTER_TYPES.map((booster) => {
                                  const Icon = booster.icon;
                                  const count = boosters[booster.id] || 0;
                                  const isUsed = count > 0;
                                  
                                  return (
                                    <div 
                                      key={booster.id} 
                                      className={`relative flex items-center justify-center w-6 h-6 rounded-full border ${isUsed ? `${booster.border} ${booster.bg}` : 'border-slate-700 bg-slate-800/50 grayscale opacity-40'}`}
                                      title={`${booster.name}: ${count}/2`}
                                    >
                                      <Icon className={`w-3.5 h-3.5 ${isUsed ? booster.color : 'text-slate-400'}`} />
                                      {count > 1 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-[#F5A623] text-[#0B132B] text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                                          2
                                        </span>
                                      )}
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </td>
                          
                          {/* Boosters Desktop View (Colonna separata su schermi grandi) */}
                          <td className="px-1 py-4 sm:px-4 sm:py-6 hidden md:table-cell align-middle">
                            <div className="flex gap-2 items-center justify-center">
                              {(() => {
                                const customInfo = getCustomTeamInfo(row.username, row.name);
                                const boosters = customInfo?.boosters || {};
                                
                                return BOOSTER_TYPES.map((booster) => {
                                  const Icon = booster.icon;
                                  const count = boosters[booster.id] || 0;
                                  const isUsed = count > 0;
                                  
                                  return (
                                    <div 
                                      key={booster.id} 
                                      className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${isUsed ? `${booster.border} ${booster.bg} shadow-[0_0_8px_rgba(0,0,0,0.3)]` : 'border-slate-700 bg-slate-800/50 grayscale opacity-40 hover:opacity-60'}`}
                                      title={`${booster.name}: ${count}/2`}
                                    >
                                      <Icon className={`w-4 h-4 ${isUsed ? booster.color : 'text-slate-400'}`} />
                                      {count > 1 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-[#F5A623] text-[#0B132B] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                          2
                                        </span>
                                      )}
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </td>

                          <td className="px-1 py-4 sm:px-6 sm:py-6 text-center font-mono text-base sm:text-2xl font-black text-[#F5A623] drop-shadow-sm whitespace-nowrap align-middle">
                            {row.totalScore.toFixed(1)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050A1F]/95 backdrop-blur-md border-t border-[#F5A623]/50 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveTab('generale')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'generale' ? 'text-[#F5A623]' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wider">CLASSIFICA</span>
          </button>
          <button 
            disabled
            className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-slate-600 cursor-not-allowed relative"
            title="Funzionalità in arrivo"
          >
            <Trophy className="h-5 w-5 opacity-50" />
            <span className="text-[10px] font-bold tracking-wider opacity-50">COPPA</span>
            <span className="absolute top-1 right-1/4 translate-x-1/2 bg-[#F5A623]/20 text-[#F5A623] text-[7px] px-1 py-[1px] rounded-sm border border-[#F5A623]/30 tracking-widest">PRESTO</span>
          </button>
          <button 
            onClick={() => setActiveTab('calendario')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'calendario' ? 'text-[#F5A623]' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wider">CALENDARIO</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
