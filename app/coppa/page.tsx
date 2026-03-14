'use client';

import React, { useState, FormEvent, useEffect, useMemo, useCallback } from 'react';
import { Plus, Users, Swords, Trophy, ChevronLeft, Loader, Trash2, Settings, AlertCircle, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateBracket } from '@/lib/utils';
import BracketPreview from './BracketPreview';
import CoppaDashboard from './CoppaDashboard';

const CoppaPage = () => {
  const router = useRouter();
  const [selectedCupId, setSelectedCupId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCup, setEditingCup] = useState<any | null>(null);
  // Form state
  const [cupName, setCupName] = useState('');
  const [enableGroups, setEnableGroups] = useState(false);
  const [threshold, setThreshold] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<any[]>([]);
  const [numGroups, setNumGroups] = useState<number>(0);
  const [numQualifiers, setNumQualifiers] = useState<number>(0);
  const [bracketWarning, setBracketWarning] = useState<string | null>(null);
  const [races, setRaces] = useState<any[]>([]);
  const [giornataInizio, setGiornataInizio] = useState<string>('');

  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Cups list state
  const [cups, setCups] = useState<any[]>([]);
  const [isLoadingCups, setIsLoadingCups] = useState(true);
  const [fetchCupsError, setFetchCupsError] = useState<string | null>(null);

  // League participants state
  const [leagueParticipants, setLeagueParticipants] = useState<any[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [fetchParticipantsError, setFetchParticipantsError] = useState<string | null>(null);

  const backgroundUrl = `/api/drive-images?type=cup&name=coppa_background`;

  const isLocked = useMemo(() => {
    if (!isEditing || !editingCup || !editingCup.giornata_inizio) return false;

    // If there are no future races and the cup has a start date, it is definitely locked
    if (races.length === 0 && editingCup.giornata_inizio) return true;

    const startSession = races.find(r => r.session_key === parseInt(editingCup.giornata_inizio));

    // If the start session is not found among the future races, it means that it has already passed.
    if (!startSession) {
        // We could want to check if the start date is actually in the past,
        // but for simplicity, if it's not in the future, we consider it locked.
        return true;
    }

    const startDate = new Date(startSession.date_start);
    const now = new Date();
    // Lock modification 1 day before start
    const lockDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    return now > lockDate;
  }, [isEditing, editingCup, races]);

  useEffect(() => {
    const handlePopState = () => {
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length === 3 && pathParts[1] === 'coppa') {
        setSelectedCupId(pathParts[2]);
      } else {
        setSelectedCupId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial check
    handlePopState();

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleSelectCup = (cupId: string) => {
    setSelectedCupId(cupId);
    window.history.pushState({}, '', `/coppa/${cupId}`);
  };

  const handleBackToOverview = () => {
    setSelectedCupId(null);
    router.push('/?tab=coppa');
  };

  const fetchData = useCallback(async () => {
    setIsLoadingCups(true);
    setFetchCupsError(null);

    try {
      const cupsResponse = await fetch('/api/coppa');
      if (!cupsResponse.ok) throw new Error('Errore nel caricamento delle coppe');
      const cupsData = await cupsResponse.json();
      setCups(cupsData);
    } catch (error: any) {
      setFetchCupsError(error.message);
    } finally {
      setIsLoadingCups(false);
    }
  }, []);

    const fetchParticipants = useCallback(async () => {

      if (leagueParticipants.length > 0) return; // Fetch only once

      setIsLoadingParticipants(true);

      setFetchParticipantsError(null);

      try {

        const participantsResponse = await fetch('/api/f1-fantasy');

        if (!participantsResponse.ok) throw new Error('Errore nel caricamento dei partecipanti della lega');

        const participantsData = await participantsResponse.json();

        setLeagueParticipants(participantsData.aggregated || []);

      } catch (error: any) {

        setFetchParticipantsError(error.message);

      } finally {

        setIsLoadingParticipants(false);

      }

    }, [leagueParticipants.length]);

  

    useEffect(() => {

      fetchData();

    }, [fetchData]);

    

    // Fetch participants only when the creation or edit form is opened

    useEffect(() => {

      if (isCreating || isEditing) {

          fetchParticipants();

          fetchRaces();

      }

    }, [isCreating, isEditing, fetchParticipants]);

  const fetchRaces = async () => {
    try {
        const response = await fetch('/api/calendar');
        if (!response.ok) {
            throw new Error('Errore nel caricamento del calendario');
        }
        const data = await response.json();
        setRaces(data);
    } catch (error) {
        console.error(error);
    }
  };

  useEffect(() => {
    if (!enableGroups) {
        setNumGroups(0);
        setNumQualifiers(0);
    }
  }, [enableGroups]);

  const groupDivisions = useMemo(() => {
    const numParticipants = selectedParticipants.length;
    if (numParticipants < 4) return [];

    const divisions = [];
    // Consenti qualsiasi numero di gironi purché ci siano almeno 2 partecipanti per girone (in media)
    // Rimosso il controllo rigoroso del modulo (numParticipants % i === 0)
    const maxGroups = Math.floor(numParticipants / 2);
    for (let i = 2; i <= maxGroups; i++) {
        divisions.push(i);
    }
    return divisions;
  }, [selectedParticipants.length]);

  const qualifierOptions = useMemo(() => {
    if (numGroups === 0) return [];
    
    // Calcola la dimensione minima di un girone in caso di distribuzione irregolare
    // Es. 10 partecipanti / 3 gironi = 3.33 -> Minimo 3 partecipanti
    const minGroupSize = Math.floor(selectedParticipants.length / numGroups);
    if (minGroupSize < 2) return [];

    // I qualificati massimi non possono superare la metà del girone più piccolo (conservativo)
    const maxQualifiers = Math.max(1, Math.floor(minGroupSize / 2));
    return Array.from({ length: maxQualifiers }, (_, i) => i + 1);
  }, [selectedParticipants.length, numGroups]);

  useEffect(() => {
    if (qualifierOptions.length > 0 && !qualifierOptions.includes(numQualifiers)) {
      setNumQualifiers(0);
    }
  }, [qualifierOptions, numQualifiers]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const imageUrl = `/api/drive-images?type=cup&name=${cupName}`;

    try {
      const response = await fetch('/api/coppa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cupName,
          participants: selectedParticipants,
          imageUrl,
          giornataInizio,
          settings: {
            groups: enableGroups,
            scoreThreshold: threshold ? Number(threshold) : null,
            numGroups: enableGroups ? numGroups : 0,
            numQualifiers: enableGroups ? numQualifiers : 0,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Qualcosa è andato storto');
      }

      setIsCreating(false);
      setCupName('');
      setEnableGroups(false);
      setThreshold('');
      setSelectedParticipants([]);
      setGiornataInizio('');
      await fetchData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManage = (cup: any) => {
    setEditingCup(cup);
    setSelectedParticipants(cup.participants);
    // Populate form state
    setCupName(cup.name || '');
    setGiornataInizio(cup.giornata_inizio || '');
    setThreshold(cup.settings?.scoreThreshold?.toString() || '');
    setEnableGroups(cup.settings?.groups || false);
    setNumGroups(cup.settings?.numGroups || 0);
    setNumQualifiers(cup.settings?.numQualifiers || 0);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCloseForms = () => {
      const cupIdToRestore = editingCup?.id.replace('cup:', '');
      setIsCreating(false);
      setIsEditing(false);
      setEditingCup(null);
      setSelectedParticipants([]);
      setCupName('');
      setEnableGroups(false);
      setThreshold('');
      setFormError(null);
      setGiornataInizio('');
      if (cupIdToRestore) {
        fetchData(); // Refetch to get latest data after update
        setSelectedCupId(cupIdToRestore);
      }
  };

  const handleDelete = async (cupId: string) => {
    const adminPassword = prompt("Per eliminare la coppa, inserisci la password di amministrazione:");
    if (adminPassword === null) return;

    setIsLoading(true);
    setFormError(null);
    try {
      const response = await fetch('/api/coppa', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cupId.replace('cup:', ''), adminPassword }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Errore durante l'eliminazione della coppa");
      }
      await fetchData();
    } catch (err: any) {
      setFormError(err.message);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipantSelection = (participant: any) => {
    setSelectedParticipants((prev) => 
      prev.some(p => p.username === participant.username)
        ? prev.filter(p => p.username !== participant.username)
        : prev.length < 15 ? [...prev, participant] : prev
    );
  };

  const bracket = useMemo(() => {
    setBracketWarning(null);
    const numParticipants = selectedParticipants.length;
    if (numParticipants < 4) return null;

    let participantsForBracket = selectedParticipants;
    let warning = null;

    if (enableGroups) {
        const totalQualifiers = numGroups * numQualifiers;
        if (totalQualifiers > 0) {
            if (totalQualifiers < 4) {
                warning = `Con questa configurazione, si qualificherebbero solo ${totalQualifiers} squadre. Seleziona un numero di gironi/qualificati tale per cui il totale sia almeno 4 per avere Semifinali o Quarti.`;
            }
            // Rimosso il blocco per potenza di 2. Il sistema genererà BYE se necessario (es. 6 qualificati -> 2 BYE ai quarti)
            participantsForBracket = Array.from({ length: totalQualifiers }, (_, i) => ({ username: `Qualificato ${i + 1}` }));
        }
    } else {
      if ((numParticipants & (numParticipants - 1)) !== 0) {
        const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(numParticipants)));
        warning = `Per un torneo a eliminazione diretta, il numero di partecipanti deve essere una potenza di 2 (es. 4, 8, 16). Per favore, seleziona ${nextPowerOfTwo} partecipanti o abilita la fase a gironi.`;
      }
    }
    
    setBracketWarning(warning);
    if(warning) return null;

    return generateBracket(participantsForBracket, { groups: enableGroups, numGroups, numQualifiers });
  }, [selectedParticipants, enableGroups, numGroups, numQualifiers]);

  const isSubmitDisabled = cupName.length < 3 || selectedParticipants.length < 4 || selectedParticipants.length > 15 || !giornataInizio;

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

  const getSessionColor = (sessionName: string) => {
    if (sessionName.startsWith('Practice')) return 'text-blue-400';
    if (sessionName === 'Qualifying') return 'text-yellow-400';
    if (sessionName === 'Race') return 'text-green-400';
    if (sessionName === 'Sprint') return 'text-orange-400';
    return '';
  };

  const renderCupCreationForm = () => (
    <div className="animate-fade-in">
      <button onClick={handleCloseForms} className="flex items-center space-x-2 text-slate-300 hover:text-[#F5A623] transition-colors mb-8 group">
        <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold tracking-wide">TORNA ALLA COPPA</span>
      </button>

      <div className="bg-[#1C2541]/80 backdrop-blur-md border border-[#F5A623]/30 rounded-lg shadow-2xl max-w-3xl mx-auto">
        <div className="p-6 border-b border-[#F5A623]/30">
          <div className="flex items-center space-x-4">
            <Trophy className="h-8 w-8 text-[#F5A623]" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">Crea una Nuova Coppa</h2>
              <p className="text-slate-400 text-sm">Configura le impostazioni e dai il via alla competizione.</p>
            </div>
          </div>
        </div>

        <form className="p-6 space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="cupName" className="text-sm font-bold text-slate-300 tracking-wider uppercase">Nome Coppa</label>
            <input type="text" id="cupName" value={cupName} onChange={(e) => setCupName(e.target.value)} placeholder="Es. Coppa d'Estate" className="w-full bg-[#0B132B] border-2 border-slate-700 focus:border-[#F5A623] focus:ring-[#F5A623] rounded-md px-4 py-3 text-white transition-colors placeholder:text-slate-500" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="giornataInizio" className="text-sm font-bold text-slate-300 tracking-wider uppercase">Giornata di Inizio</label>
            <select id="giornataInizio" value={giornataInizio} onChange={(e) => setGiornataInizio(e.target.value)} className="w-full bg-[#0B132B] border-2 border-slate-700 focus:border-[#F5A623] focus:ring-[#F5A623] rounded-md px-4 py-3 text-white transition-colors" required>
              <option value="" disabled>Seleziona una giornata</option>
              {races.map(race => (
                <option key={race.session_key} value={race.session_key} className={getSessionColor(race.session_name)}>
                  {race.meeting_name} - {translateSessionName(race.session_name)} ({race.country_name}) - {new Date(race.date_start).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-300 tracking-wider uppercase">Partecipanti ({selectedParticipants.length} / 15)</label>
            {isLoadingParticipants ? <div className="flex justify-center items-center h-24"><Loader className="h-8 w-8 text-[#F5A623] animate-spin" /></div>
             : fetchParticipantsError ? <div className="text-center text-red-400">{fetchParticipantsError}</div>
             : <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-4 bg-[#0B132B] border-2 border-slate-700 rounded-md">
                  {leagueParticipants.map(p => (
                    <label key={p.username} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-slate-700/50 transition-colors">
                      <input type="checkbox" className="h-5 w-5 accent-[#F5A623] bg-slate-800" checked={selectedParticipants.some(sp => sp.username === p.username)} onChange={() => handleParticipantSelection(p)} disabled={selectedParticipants.length >= 15 && !selectedParticipants.some(sp => sp.username === p.username)} />
                      <span className="text-white">{p.username}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-slate-400">Min 4, Max 15 partecipanti</p>
               </>
            }
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-300 tracking-wider uppercase">Fase a Gironi</label>
            <div className="flex items-center space-x-4 bg-[#0B132B] border-2 border-slate-700 p-4 rounded-md">
              <input type="checkbox" id="enableGroups" checked={enableGroups} onChange={(e) => setEnableGroups(e.target.checked)} className="h-6 w-6 accent-[#F5A623]" />
              <label htmlFor="enableGroups" className="text-white font-medium">Abilita fase a gironi</label>
            </div>
            {enableGroups && (
              <div className="space-y-6 bg-[#0B132B]/50 border-2 border-slate-700 p-4 rounded-md animate-fade-in">
                <h4 className="text-md font-bold text-slate-300 tracking-wider uppercase">Configurazione Gironi</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="numGroups" className="text-sm font-bold text-slate-300">Numero di Gironi</label>
                    <select id="numGroups" value={numGroups} onChange={(e) => setNumGroups(Number(e.target.value))} className="w-full bg-slate-800 border-2 border-slate-600 focus:border-[#F5A623] focus:ring-[#F5A623] rounded-md px-4 py-3 text-white" disabled={groupDivisions.length === 0}>
                      <option value={0} disabled>{groupDivisions.length === 0 ? "Partecipanti non divisibili" : "Seleziona gironi"}</option>
                      {groupDivisions.map(div => <option key={div} value={div}>{div} gironi</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="numQualifiers" className="text-sm font-bold text-slate-300">Qualificati per Girone</label>
                    <select id="numQualifiers" value={numQualifiers} onChange={(e) => setNumQualifiers(Number(e.target.value))} className="w-full bg-slate-800 border-2 border-slate-600 focus:border-[#F5A623] focus:ring-[#F5A623] rounded-md px-4 py-3 text-white" disabled={numGroups === 0 || qualifierOptions.length === 0}>
                      <option value={0} disabled>{qualifierOptions.length === 0 ? "Nessuna opzione" : "Seleziona qualificati"}</option>
                      {qualifierOptions.map(q => <option key={q} value={q}>{q} {q > 1 ? 'qualificati' : 'qualificato'}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {bracketWarning && <div className="bg-red-900/30 border-2 border-red-500/50 text-red-300 p-4 rounded-md flex items-start space-x-3"><AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" /><p className="text-sm font-medium">{bracketWarning}</p></div>}
          {bracket && <div className="space-y-3"><label className="text-sm font-bold text-slate-300 tracking-wider uppercase">Anteprima Tabellone</label><BracketPreview bracket={bracket} /></div>}

          <div className="pt-6 border-t border-slate-700/50 flex flex-col items-end gap-4">
            {isSubmitDisabled && cupName.length > 0 && <p className="text-yellow-400 text-sm text-right">Devi inserire un nome per la coppa, selezionare da 4 a 15 partecipanti e una giornata d&apos;inizio.</p>}
            <button type="submit" disabled={isLoading || isSubmitDisabled || bracketWarning !== null} className="bg-gradient-to-r from-[#F5A623] to-[#D35400] text-white font-black tracking-widest uppercase px-8 py-3 rounded-md hover:opacity-90 transition-opacity shadow-[0_4px_15px_rgba(245,166,35,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Creazione...' : 'Crea Coppa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCup) return;
    setIsLoading(true);
    setFormError(null);
    try {
      const response = await fetch('/api/coppa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: editingCup.id.replace('cup:', ''),
            cupName,
            giornataInizio,
            participants: selectedParticipants,
            settings: {
                groups: enableGroups,
                scoreThreshold: threshold ? Number(threshold) : null,
                numGroups: enableGroups ? numGroups : 0,
                numQualifiers: enableGroups ? numQualifiers : 0,
            }
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Qualcosa è andato storto');
      }
      handleCloseForms();
      await fetchData();
    } catch (err: any) {
      setFormError(err.message);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const renderCupEditingForm = () => (
    <div className="animate-fade-in">
      <button onClick={handleCloseForms} className="flex items-center space-x-2 text-slate-300 hover:text-[#F5A623] transition-colors mb-8 group">
        <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold tracking-wide">ANNULLA MODIFICHE</span>
      </button>

      <div className="bg-[#1C2541]/80 backdrop-blur-md border border-[#F5A623]/30 rounded-lg shadow-2xl max-w-3xl mx-auto">
        <div className="p-6 border-b border-[#F5A623]/30">
          <div className="flex items-center space-x-4">
            <Settings className="h-8 w-8 text-[#F5A623]" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">Modifica Partecipanti: {editingCup?.name}</h2>
              <p className="text-slate-400 text-sm">Aggiungi o rimuovi partecipanti da questa coppa.</p>
            </div>
          </div>
        </div>

        <form className="p-6 space-y-8" onSubmit={handleUpdate}>
          <div className="space-y-3">
             <label className="text-sm font-bold text-slate-300 tracking-wider uppercase">Partecipanti ({selectedParticipants.length} / 15)</label>
            {isLoadingParticipants ? <div className="flex justify-center items-center h-24"><Loader className="h-8 w-8 text-[#F5A623] animate-spin" /></div>
             : fetchParticipantsError ? <div className="text-center text-red-400">{fetchParticipantsError}</div>
             : <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-4 bg-[#0B132B] border-2 border-slate-700 rounded-md">
                  {leagueParticipants.map(p => (
                    <label key={p.username} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-slate-700/50 transition-colors">
                      <input type="checkbox" className="h-5 w-5 accent-[#F5A623] bg-slate-800" checked={selectedParticipants.some(sp => sp.username === p.username)} onChange={() => handleParticipantSelection(p)} disabled={selectedParticipants.length >= 15 && !selectedParticipants.some(sp => sp.username === p.username)} />
                      <span className="text-white">{p.username}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-slate-400">Min 4, Max 15 partecipanti</p>
               </>
            }
          </div>

          <div className="space-y-2">
            <label htmlFor="giornataInizioEdit" className="text-sm font-bold text-slate-300 tracking-wider uppercase">Giornata di Inizio</label>
            <select id="giornataInizioEdit" value={giornataInizio} onChange={(e) => setGiornataInizio(e.target.value)} className="w-full bg-[#0B132B] border-2 border-slate-700 focus:border-[#F5A623] focus:ring-[#F5A623] rounded-md px-4 py-3 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLocked}>
              <option value="" disabled>Seleziona una giornata</option>
              {/* Mostra la giornata attuale anche se passata per non rompere la UI, ma blocca la modifica */}
              {editingCup && !races.some(r => r.session_key === parseInt(editingCup.giornata_inizio)) && (
                  <option key={editingCup.giornata_inizio} value={editingCup.giornata_inizio}>
                      Gara Iniziata (Non Modificabile)
                  </option>
              )}
              {races.map(race => (
                <option key={race.session_key} value={race.session_key} className={getSessionColor(race.session_name)}>
                  {race.meeting_name} - {translateSessionName(race.session_name)} ({race.country_name}) - {new Date(race.date_start).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </option>
              ))}
            </select>
            {isLocked && <p className="text-xs text-amber-400 mt-2">La giornata di inizio non è modificabile perché la coppa è iniziata o sta per iniziare.</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="threshold" className="text-sm font-bold text-slate-300 tracking-wider uppercase">Soglia Vittoria (Delta Punti)</label>
            <input type="number" id="threshold" value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="Es. 10" className="w-full bg-[#0B132B] border-2 border-slate-700 focus:border-[#F5A623] focus:ring-[#F5A623] rounded-md px-4 py-3 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLocked} />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-300 tracking-wider uppercase">Fase a Gironi</label>
            <div className={`flex items-center space-x-4 bg-[#0B132B] border-2 border-slate-700 p-4 rounded-md ${isLocked ? 'opacity-50' : ''}`}>
              <input type="checkbox" id="enableGroupsEdit" checked={enableGroups} onChange={(e) => setEnableGroups(e.target.checked)} className="h-6 w-6 accent-[#F5A623]" disabled={isLocked} />
              <label htmlFor="enableGroupsEdit" className="text-white font-medium">Abilita fase a gironi</label>
            </div>
            {enableGroups && (
              <div className={`space-y-6 bg-[#0B132B]/50 border-2 border-slate-700 p-4 rounded-md animate-fade-in ${isLocked ? 'opacity-50' : ''}`}>
                <h4 className="text-md font-bold text-slate-300 tracking-wider uppercase">Configurazione Gironi</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="numGroupsEdit" className="text-sm font-bold text-slate-300">Numero di Gironi</label>
                    <select id="numGroupsEdit" value={numGroups} onChange={(e) => setNumGroups(Number(e.target.value))} className="w-full bg-slate-800 border-2 border-slate-600 focus:border-[#F5A623] focus:ring-[#F5A623] rounded-md px-4 py-3 text-white" disabled={isLocked || groupDivisions.length === 0}>
                      {groupDivisions.map(div => <option key={div} value={div}>{div} gironi</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="numQualifiersEdit" className="text-sm font-bold text-slate-300">Qualificati per Girone</label>
                    <select id="numQualifiersEdit" value={numQualifiers} onChange={(e) => setNumQualifiers(Number(e.target.value))} className="w-full bg-slate-800 border-2 border-slate-600 focus:border-[#F5A623] focus:ring-[#F5A623] rounded-md px-4 py-3 text-white" disabled={isLocked || numGroups === 0 || qualifierOptions.length === 0}>
                      <option value={0} disabled>{qualifierOptions.length === 0 ? "Nessuna opzione" : "Seleziona qualificati"}</option>
                      {qualifierOptions.map(q => <option key={q} value={q}>{q} {q > 1 ? 'qualificati' : 'qualificato'}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {bracketWarning && !isLocked && <div className="bg-red-900/30 border-2 border-red-500/50 text-red-300 p-4 rounded-md flex items-start space-x-3"><AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" /><p className="text-sm font-medium">{bracketWarning}</p></div>}

          {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}
          <div className="pt-6 border-t border-slate-700/50 flex items-center justify-end gap-4">
             <button type="submit" disabled={isLoading || selectedParticipants.length < 4 || selectedParticipants.length > 15} className="bg-gradient-to-r from-[#F5A623] to-[#D35400] text-white font-black tracking-widest uppercase px-8 py-3 rounded-md hover:opacity-90 transition-opacity shadow-[0_4px_15px_rgba(245,166,35,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => {
      switch (status) {
          case 'IN CORSO':
              return 'bg-amber-500/80 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]';
          case 'TERMINATA':
              return 'bg-slate-600/80 text-slate-200 border border-slate-500';
          case 'APERTA':
              return 'bg-green-500/80 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]';
          default:
              return 'bg-slate-500/80 text-white';
      }
  };

  const renderCupOverview = () => (
    <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div className='text-center sm:text-left'>
                <h2 className="text-3xl md:text-4xl font-black text-[#F5A623] tracking-wider drop-shadow-lg uppercase">PANORAMICA COPPE</h2>
                <p className="text-slate-300 mt-1 text-sm md:text-base">Competizioni speciali a eliminazione e a punti.</p>
            </div>
            <button onClick={() => setIsCreating(true)} className="flex items-center self-center sm:self-auto space-x-3 bg-gradient-to-r from-[#F5A623] to-[#D35400] text-white font-black tracking-widest uppercase px-6 py-3 rounded-md hover:opacity-90 transition-opacity shadow-[0_4px_15px_rgba(245,166,35,0.3)]">
                <Plus className="h-5 w-5" />
                <span>Crea Coppa</span>
            </button>
        </div>

      {isLoadingCups ? <div className="flex justify-center items-center py-20"><Loader className="h-12 w-12 text-[#F5A623] animate-spin" /></div>
       : fetchCupsError ? <div className="text-center py-20 px-6 bg-red-900/30 border-2 border-dashed border-red-500/50 rounded-lg"><h3 className="text-xl font-bold text-red-400">Errore</h3><p className="text-red-300 mt-2">{fetchCupsError}</p></div>
       : cups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cups.map((cup) => (
          <div onClick={() => handleSelectCup(cup.id.replace('cup:', ''))} key={cup.id} className="cursor-pointer relative block rounded-lg overflow-hidden border-2 border-transparent hover:border-[#F5A623] transition-all duration-300 group shadow-2xl">
                <div className="absolute inset-0">
                    <Image 
                        src={cup.imageUrl} 
                        alt={`Immagine ${cup.name}`} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { 
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none'; 
                        }} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                </div>
                <div className="relative flex flex-col justify-end h-80 p-6 text-white">
                    <h3 className="text-2xl font-black uppercase tracking-wider group-hover:text-[#F5A623] transition-colors duration-300">{cup.name}</h3>
                    <div className="border-t-2 border-[#F5A623] w-1/4 my-3"></div>
                    <div className="flex items-center space-x-4 text-sm text-slate-300">
                        <div className="flex items-center space-x-1.5">
                            <Users className="h-4 w-4" />
                            <span>{cup.participants.length} Partecipanti</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <Swords className="h-4 w-4" />
                            <span>{cup.matches.length} Scontri</span>
                        </div>
                    </div>
                     <span className={`absolute top-4 right-4 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm ${getStatusBadge(cup.status)}`}>
                        {cup.status}
                    </span>
                </div>
                <div className="absolute top-4 left-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleManage(cup); }} className="p-2 bg-slate-800/50 rounded-full text-slate-300 hover:text-white hover:bg-slate-700/70 transition-colors" title="Gestisci"><Settings className="h-4 w-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDelete(cup.id); }} className="p-2 bg-red-800/50 rounded-full text-slate-300 hover:text-white hover:bg-red-700/70 transition-colors" title="Elimina"><Trash2 className="h-4 w-4" /></button>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 bg-[#1C2541]/50 backdrop-blur-sm border-2 border-dashed border-slate-700 rounded-lg">
          <Trophy className="h-16 w-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-300 tracking-wide">Nessuna coppa trovata</h3>
          <p className="text-slate-400 mt-2 max-w-md mx-auto">Crea una nuova coppa per iniziare a competere con i tuoi amici in un formato diverso!</p>
        </div>
      )}
    </div>
  );

  const handleEditFromDashboard = () => {
    const cupToEdit = cups.find(c => c.id === `cup:${selectedCupId}`);
    if (cupToEdit) {
        handleManage(cupToEdit);
    }
  };

  const selectedCupData = useMemo(() => {
    if (!selectedCupId || cups.length === 0) return null;
    return cups.find(c => c.id === `cup:${selectedCupId}`) || null;
  }, [selectedCupId, cups]);

  return (
    <div className="relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${backgroundUrl}')`, backgroundColor: '#0B132B' }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>
        <div className="relative container mx-auto p-4 sm:p-6 lg:p-8 text-white">
            {isCreating ? renderCupCreationForm() :
             isEditing ? renderCupEditingForm() :
             selectedCupId ? <CoppaDashboard coppaId={selectedCupId} initialData={selectedCupData} onBack={handleBackToOverview} onEdit={handleEditFromDashboard} /> :
             renderCupOverview()}
        </div>
    </div>
  );
};

export default CoppaPage;
