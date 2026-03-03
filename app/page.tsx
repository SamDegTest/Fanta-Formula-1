'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, Settings, ChevronRight, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

export default function FantaF1Dashboard() {
  const [activeTab, setActiveTab] = useState<'generale' | 'coppa'>('generale');
  
  // API States
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [syncResult, setSyncResult] = useState<any>(null);
  const [realStandings, setRealStandings] = useState<any[]>([]);
  
  // Custom Logo State
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem('leagueLogo', base64String);
        setCustomLogo(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSync = async () => {
    setSyncStatus('loading');
    setSyncResult(null);

    try {
      // Tentativo tramite Proxy Serverless
      const res = await fetch('/api/f1-fantasy', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.isNetworkError && data.fallbackUrl) {
          // Fallback: Tentativo di chiamata diretta dal client (potrebbe fallire per CORS)
          try {
            // Nota: Il client non può inviare facilmente header custom come Cookie a causa di CORS,
            // ma proviamo comunque la richiesta. L'utente dovrà usare un'estensione CORS.
            const clientRes = await fetch(data.fallbackUrl);
            const clientData = await clientRes.json();
            
            // Applica la logica di aggregazione anche lato client
            let aggregated: any[] = [];
            const teams = clientData.Value?.leaderboard || clientData.Data?.Value || clientData.teams || clientData.list || (Array.isArray(clientData) ? clientData : []);
            
            if (teams && teams.length > 0) {
              const usersMap: Record<string, any> = {};
              teams.forEach((team: any) => {
                const teamName = team.team_name ? decodeURIComponent(team.team_name) : `Team ${team.team_no || ''}`;
                
                // REGOLA FISSA: Ignora sempre la squadra Admin_001
                if (teamName === 'Admin_001') {
                  return;
                }

                const username = team.user_name || 'Sconosciuto';
                const score = parseFloat(team.cur_points || team.score || team.points || team.total_points || '0') || 0;
                
                if (!usersMap[username]) {
                  usersMap[username] = { username, totalScore: 0, teamsCount: 0, teams: [] };
                }
                usersMap[username].totalScore += score;
                usersMap[username].teamsCount += 1;
                usersMap[username].teams.push({ name: teamName, score, team_no: team.team_no });
              });
              aggregated = Object.values(usersMap).sort((a: any, b: any) => b.totalScore - a.totalScore);
              aggregated.forEach((user, index) => { user.rank = index + 1; });
            }

            setSyncStatus('success');
            setSyncResult({ 
              note: "Dati recuperati direttamente dal browser (bypassando il server)",
              aggregated: aggregated,
              raw_data: clientData 
            });
            if (aggregated.length > 0) {
              setRealStandings([...aggregated]); // Forza un nuovo array per il re-render
            }
            return;
          } catch (clientErr: any) {
            throw new Error(`Il server cloud è bloccato e il tuo browser blocca la richiesta per CORS. Errore: ${clientErr.message}. Soluzione: Usa un'estensione per disabilitare CORS nel browser temporaneamente.`);
          }
        }
        throw new Error(data.error || 'Errore durante la sincronizzazione');
      }
      
      setSyncStatus('success');
      setSyncResult(data);
      if (data.aggregated && data.aggregated.length > 0) {
        setRealStandings([...data.aggregated]); // Forza un nuovo array per il re-render
      }
    } catch (err: any) {
      setSyncStatus('error');
      setSyncResult({ error: err.message });
    }
  };

  // Carica i dati all'avvio
  useEffect(() => {
    handleSync();
    // Carica il logo salvato se esiste
    const savedLogo = localStorage.getItem('leagueLogo');
    if (savedLogo) {
      setCustomLogo(savedLogo);
    }
  }, []);

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
      
      {/* Header */}
      <header className="bg-[#050A1F]/80 backdrop-blur-md border-b-2 border-[#F5A623] shadow-[0_4px_20px_rgba(245,166,35,0.15)] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center md:justify-between items-center h-20">
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => setActiveTab('generale')}
                className={`font-bold tracking-wide flex items-center space-x-2 pb-2 transition-all ${activeTab === 'generale' ? 'text-[#F5A623] border-b-2 border-[#F5A623]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Users className="h-5 w-5" />
                <span>CLASSIFICA GENERALE</span>
              </button>
              <button 
                onClick={() => setActiveTab('coppa')}
                className={`font-bold tracking-wide flex items-center space-x-2 pb-2 transition-all ${activeTab === 'coppa' ? 'text-[#F5A623] border-b-2 border-[#F5A623]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Trophy className="h-5 w-5" />
                <span>COPPA</span>
              </button>
              <a href="#" className="text-slate-400 hover:text-slate-200 font-bold tracking-wide flex items-center space-x-2 transition-all pb-2">
                <Calendar className="h-5 w-5" />
                <span>CALENDARIO</span>
              </a>
            </nav>
            <button className="p-2 text-slate-400 hover:text-[#F5A623] transition-colors">
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
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
                      <thead className="text-xs text-[#F5A623] uppercase bg-[#0B132B]/50 border-b border-[#F5A623]/30 tracking-wider">
                        <tr>
                          <th scope="col" className="px-6 py-4 w-12 text-center font-black">Pos</th>
                          <th scope="col" className="px-6 py-4 font-black">Team / Utente</th>
                          <th scope="col" className="px-4 py-4 text-center font-black text-[#F5A623]">Pti</th>
                          <th scope="col" className="px-3 py-4 text-center font-black" title="Giocate">G</th>
                          <th scope="col" className="px-3 py-4 text-center font-black text-emerald-400" title="Vinte">V</th>
                          <th scope="col" className="px-3 py-4 text-center font-black text-[#F5A623]" title="Pareggiate">N</th>
                          <th scope="col" className="px-3 py-4 text-center font-black text-rose-400" title="Perse">P</th>
                          <th scope="col" className="px-4 py-4 text-right font-black" title="Punti Fatti">PF</th>
                          <th scope="col" className="px-4 py-4 text-right font-black" title="Punti Subiti">PS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupStandings.map((row, idx) => (
                          <tr key={idx} className="bg-[#1C2541] border-b border-[#F5A623]/10 hover:bg-[#2A365C] transition-colors group">
                            <td className="px-6 py-5 text-center font-medium">
                              {row.pos === 1 || row.pos === 2 ? (
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#F5A623] text-[#0B132B] text-sm font-black shadow-[0_0_10px_rgba(245,166,35,0.4)]">
                                  {row.pos}
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#0B132B] text-slate-400 border border-slate-700 text-sm font-black">
                                  {row.pos}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-5 font-black text-white whitespace-nowrap tracking-wide group-hover:text-[#F5A623] transition-colors">
                              {row.name}
                            </td>
                            <td className="px-4 py-5 text-center font-black text-[#F5A623] text-xl drop-shadow-sm">
                              {row.pti}
                            </td>
                            <td className="px-3 py-5 text-center font-bold">{row.g}</td>
                            <td className="px-3 py-5 text-center font-bold text-emerald-400">{row.v}</td>
                            <td className="px-3 py-5 text-center font-bold text-[#F5A623]">{row.n}</td>
                            <td className="px-3 py-5 text-center font-bold text-rose-400">{row.p}</td>
                            <td className="px-4 py-5 text-right font-mono font-bold text-slate-300">{row.pf.toFixed(1)}</td>
                            <td className="px-4 py-5 text-right font-mono font-bold text-slate-500">{row.ps.toFixed(1)}</td>
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
                      <div key={idx} className="p-5 hover:bg-[#2A365C] transition-colors group">
                        <div className="flex justify-between items-center mb-3">
                          <span className={`font-black tracking-wide ${match.resultA === 3 ? 'text-[#F5A623]' : 'text-slate-300 group-hover:text-white'}`}>
                            {match.userA}
                          </span>
                          <span className="font-mono text-lg font-black bg-[#0B132B] text-[#F5A623] px-3 py-1 border border-[#F5A623]/30 shadow-[0_0_10px_rgba(245,166,35,0.1)]">
                            {match.scoreA.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`font-black tracking-wide ${match.resultB === 3 ? 'text-[#F5A623]' : 'text-slate-300 group-hover:text-white'}`}>
                            {match.userB}
                          </span>
                          <span className="font-mono text-lg font-black bg-[#0B132B] text-[#F5A623] px-3 py-1 border border-[#F5A623]/30 shadow-[0_0_10px_rgba(245,166,35,0.1)]">
                            {match.scoreB.toFixed(1)}
                          </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#F5A623]/10 flex justify-between items-center text-xs uppercase tracking-wider">
                          <span className="text-slate-500 font-bold">
                            DIFF: {Math.abs(match.scoreA - match.scoreB).toFixed(1)} (SOGLIA: {match.threshold})
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
        ) : (
          <>
            <div className="mb-10 relative flex flex-col items-center">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative h-24 w-24 flex items-center justify-center bg-[#1C2541] rounded-full border-2 border-[#F5A623]/50 overflow-hidden shadow-[0_0_25px_rgba(245,166,35,0.3)] group cursor-pointer" title="Clicca per caricare il logo">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" 
                  />
                  
                  <Trophy className="h-10 w-10 text-[#F5A623] absolute z-0" />
                  
                  <img 
                    src={customLogo || "/logo.png"} 
                    alt="League Logo" 
                    className="h-full w-full object-cover relative z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={(e) => {
                      e.currentTarget.style.display = 'block';
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center z-20 transition-all">
                    <span className="text-xs font-black text-white tracking-wider">MODIFICA</span>
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-[#F5A623] tracking-wider drop-shadow-md uppercase text-center">
                  {syncResult?.leagueName || 'PISTON LEAGUE'}
                </h2>
              </div>
              
              <div className="mt-6 md:mt-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2">
                <button 
                  onClick={handleSync}
                  disabled={syncStatus === 'loading'}
                  className="flex items-center space-x-2 bg-[#1C2541] text-[#F5A623] hover:bg-[#2A365C] px-5 py-2.5 rounded-none border border-[#F5A623] font-bold tracking-wide transition-all disabled:opacity-50 shadow-[0_0_10px_rgba(245,166,35,0.2)] hover:shadow-[0_0_15px_rgba(245,166,35,0.4)]"
                >
                  <RefreshCw className={`h-5 w-5 ${syncStatus === 'loading' ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">AGGIORNA DATI</span>
                </button>
              </div>
            </div>

            {syncStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-none text-red-200 text-sm">
                <p className="font-bold mb-1 tracking-wide">ERRORE DI SINCRONIZZAZIONE</p>
                <p>{syncResult?.error}</p>
              </div>
            )}

            <div className="bg-[#1C2541] rounded-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-[#F5A623]/30 overflow-hidden max-w-4xl mx-auto relative">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#F5A623]"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#F5A623]"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#F5A623]"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#F5A623]"></div>
              
              <div className="overflow-x-auto max-h-[60vh] custom-scrollbar relative">
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="text-xs text-[#F5A623] uppercase bg-[#0B132B] border-b border-[#F5A623]/30 tracking-wider sticky top-0 z-20 shadow-md">
                    <tr>
                      <th scope="col" className="px-6 py-5 w-16 text-center font-black">Pos</th>
                      <th scope="col" className="px-6 py-5 font-black">Utente</th>
                      <th scope="col" className="px-6 py-5 text-center font-black">Scuderie</th>
                      <th scope="col" className="px-6 py-5 text-right font-black">Punteggio Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncStatus === 'loading' && realStandings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center text-[#F5A623]">
                          <RefreshCw className="h-10 w-10 animate-spin mx-auto mb-4 opacity-80" />
                          <p className="font-bold tracking-widest animate-pulse">CARICAMENTO CLASSIFICA...</p>
                        </td>
                      </tr>
                    ) : realStandings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center text-slate-400 font-medium tracking-wide">
                          NESSUN DATO DISPONIBILE. CLICCA SU "AGGIORNA DATI".
                        </td>
                      </tr>
                    ) : (
                      realStandings.map((row, idx) => (
                        <tr key={idx} className="bg-[#1C2541] border-b border-[#F5A623]/10 hover:bg-[#2A365C] transition-colors group">
                          <td className="px-6 py-6 text-center font-medium">
                            <div className="flex items-center justify-center space-x-2">
                              <span className={`inline-flex items-center justify-center w-10 h-10 font-black text-lg ${(row.rank || row.pos) === 1 ? 'bg-[#F5A623] text-[#0B132B] shadow-[0_0_15px_rgba(245,166,35,0.6)]' : (row.rank || row.pos) === 2 ? 'bg-slate-300 text-[#0B132B]' : (row.rank || row.pos) === 3 ? 'bg-[#CD7F32] text-[#0B132B]' : 'bg-[#0B132B] text-slate-400 border border-slate-700'}`}>
                                {row.rank || row.pos}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="flex flex-col">
                                {row.teams ? (
                                  <>
                                    <span className="text-base font-black text-white tracking-wide group-hover:text-[#F5A623] transition-colors">
                                      {row.teams.map((t: any) => t.name).join(' & ')}
                                    </span>
                                    <span className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                                      {row.username}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-base font-black text-white tracking-wide group-hover:text-[#F5A623] transition-colors">{row.name}</span>
                                    <span className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Utente Sconosciuto</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-[#0B132B] text-[#F5A623] border border-[#F5A623]/30 tracking-widest">
                              {row.teamsCount} / 2
                            </span>
                          </td>
                          <td className="px-6 py-6 text-right font-mono text-2xl font-black text-[#F5A623] drop-shadow-sm">
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
    </div>
  );
}
