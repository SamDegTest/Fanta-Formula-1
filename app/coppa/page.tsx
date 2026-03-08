'use client';

import React, { useState, FormEvent, useEffect, useMemo } from 'react';
import { Plus, Users, Swords, Trophy, ChevronLeft, Loader, Trash2, Settings } from 'lucide-react';
import { generateBracket } from '@/lib/utils';
import BracketPreview from './BracketPreview';

const CoppaPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCup, setEditingCup] = useState<any | null>(null);
  // Form state
  const [cupName, setCupName] = useState('');
  const [enableGroups, setEnableGroups] = useState(false);
  const [enableFinalPhase, setEnableFinalPhase] = useState(false);
  const [threshold, setThreshold] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<any[]>([]);
  const [numGroups, setNumGroups] = useState<number>(0);
  const [numQualifiers, setNumQualifiers] = useState<number>(0);

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

  const fetchData = async () => {
    setIsLoadingCups(true);
    setIsLoadingParticipants(true);
    setFetchCupsError(null);
    setFetchParticipantsError(null);

    try {
      // Fetch cups
      const cupsResponse = await fetch('/api/coppa');
      if (!cupsResponse.ok) throw new Error('Errore nel caricamento delle coppe');
      const cupsData = await cupsResponse.json();
      setCups(cupsData);
    } catch (error: any) {
      setFetchCupsError(error.message);
    } finally {
      setIsLoadingCups(false);
    }

    try {
      // Fetch participants
      const participantsResponse = await fetch('/api/f1-fantasy');
      if (!participantsResponse.ok) throw new Error('Errore nel caricamento dei partecipanti della lega');
      const participantsData = await participantsResponse.json();
      setLeagueParticipants(participantsData.aggregated || []);
    } catch (error: any) {
      setFetchParticipantsError(error.message);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!enableGroups) {
        setNumGroups(0);
        setNumQualifiers(0);
    }
  }, [enableGroups]);

  useEffect(() => {
    setNumQualifiers(0);
  }, [numGroups]);

  const groupDivisions = useMemo(() => {
    const numParticipants = selectedParticipants.length;
    if (numParticipants < 4) return [];

    const divisions = [];
    // A group should have at least 2 participants. So numGroups <= numParticipants / 2
    for (let i = 2; i <= numParticipants / 2; i++) {
        if (numParticipants % i === 0) {
            divisions.push(i);
        }
    }
    return divisions;
  }, [selectedParticipants.length]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const imageUrl = `/api/drive-images?type=cup&name=${cupName}`;

    try {
      const response = await fetch('/api/coppa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cupName,
          participants: selectedParticipants,
          imageUrl,
          settings: {
            groups: enableGroups,
            finalPhase: enableFinalPhase,
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

      // Success!
      setIsCreating(false);
      // Reset form
      setCupName('');
      setEnableGroups(false);
      setEnableFinalPhase(false);
      setThreshold('');
      setSelectedParticipants([]);
      await fetchData(); // Refresh all data
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManage = (cup: any) => {
    setEditingCup(cup);
    setSelectedParticipants(cup.participants); // Pre-fill with current participants
    setIsEditing(true);
    setIsCreating(false); // Ensure create form is closed
  };

  const handleCloseEdit = () => {
      setIsEditing(false);
      setEditingCup(null);
      setSelectedParticipants([]); // Clear selection
  };

  const handleDelete = async (cupId: string) => {
    const adminPassword = prompt("Per eliminare la coppa, inserisci la password di amministrazione:");

    if (adminPassword === null) { // User clicked 'Cancel'
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      const response = await fetch('/api/coppa', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: cupId.replace('cup:', ''), adminPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Errore durante l'eliminazione della coppa");
      }

      await fetchData(); // Refresh data
    } catch (err: any) {
      setFormError(err.message);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipantSelection = (participant: any) => {
    setSelectedParticipants((prevSelected) => {
      const isSelected = prevSelected.some(p => p.username === participant.username);
      if (isSelected) {
        return prevSelected.filter(p => p.username !== participant.username);
      } else {
        if (prevSelected.length < 15) {
          return [...prevSelected, participant];
        }
        return prevSelected; // Max 15 reached
      }
    });
  };

  const bracket = useMemo(() => {
    if (selectedParticipants.length >= 4) {
      const settings = {
        groups: enableGroups,
        numGroups: numGroups,
        numQualifiers: numQualifiers,
      };
      return generateBracket(selectedParticipants, settings);
    }
    return null;
  }, [selectedParticipants, enableGroups, numGroups, numQualifiers]);

  const isSubmitDisabled = cupName.length < 3 || selectedParticipants.length < 4 || selectedParticipants.length > 15;

  const renderCupCreationForm = () => (
    <div className="animate-fade-in">
      <button
        onClick={() => setIsCreating(false)}
        className="flex items-center space-x-2 text-slate-300 hover:text-[#F5A623] transition-colors mb-8 group"
      >
        <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold tracking-wide">TORNA ALLA COPPA</span>
      </button>

      <div className="bg-[#1C2541] border border-[#F5A623]/30 rounded-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] max-w-3xl mx-auto">
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
          {/* Nome Coppa */}
          <div className="space-y-2">
            <label htmlFor="cupName" className="text-sm font-bold text-slate-300 tracking-wider uppercase">Nome Coppa</label>
            <input
              type="text"
              id="cupName"
              value={cupName}
              onChange={(e) => setCupName(e.target.value)}
              placeholder="Es. Coppa d'Estate"
              className="w-full bg-[#0B132B] border-2 border-slate-700 focus:border-[#F5A623] focus:ring-[#F5A623] rounded-none px-4 py-3 text-white transition-colors placeholder:text-slate-500"
              required
            />
          </div>

          {/* Selezione Partecipanti */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-300 tracking-wider uppercase">Partecipanti</label>
            {isLoadingParticipants ? (
              <div className="flex justify-center items-center h-24">
                <Loader className="h-8 w-8 text-[#F5A623] animate-spin" />
              </div>
            ) : fetchParticipantsError ? (
              <div className="text-center text-red-400">{fetchParticipantsError}</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-4 bg-[#0B132B] border-2 border-slate-700 rounded-none">
                  {leagueParticipants.map(p => (
                    <label key={p.username} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-[#F5A623] bg-slate-800"
                        checked={selectedParticipants.some(sp => sp.username === p.username)}
                        onChange={() => handleParticipantSelection(p)}
                        disabled={selectedParticipants.length >= 15 && !selectedParticipants.some(sp => sp.username === p.username)}
                      />
                      <span className="text-white">{p.username}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-slate-400">
                  Selezionati: {selectedParticipants.length} (min 4, max 15)
                </p>
              </>
            )}
          </div>

          {/* Anteprima Tabellone */}
          {bracket && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 tracking-wider uppercase">Anteprima Tabellone</label>
              <BracketPreview bracket={bracket} />
            </div>
          )}

          {/* Opzione Gironi */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-300 tracking-wider uppercase">Fase a Gironi</label>
            <div className="flex items-center space-x-4 bg-[#0B132B] border-2 border-slate-700 p-4 rounded-none">
              <input type="checkbox" id="enableGroups" checked={enableGroups} onChange={(e) => setEnableGroups(e.target.checked)} className="h-6 w-6 accent-[#F5A623]" />
              <label htmlFor="enableGroups" className="text-white font-medium">Abilita fase a gironi</label>
            </div>
            {enableGroups && (
              <div className="space-y-6 bg-[#0B132B] border-2 border-slate-700 p-4 rounded-none animate-fade-in">
                <h4 className="text-md font-bold text-slate-300 tracking-wider uppercase">Configurazione Gironi</h4>

                {/* Number of Groups */}
                <div className="space-y-2">
                  <label htmlFor="numGroups" className="text-sm font-bold text-slate-300">Numero di Gironi</label>
                  <select
                    id="numGroups"
                    value={numGroups}
                    onChange={(e) => setNumGroups(Number(e.target.value))}
                    className="w-full bg-slate-800 border-2 border-slate-600 focus:border-[#F5A623] focus:ring-[#F5A623] rounded-none px-4 py-3 text-white"
                    disabled={groupDivisions.length === 0}
                  >
                    <option value={0} disabled>
                      {groupDivisions.length === 0 ? "Seleziona un numero di partecipanti divisibile" : "Seleziona numero gironi"}
                    </option>
                    {groupDivisions.map(div => (
                      <option key={div} value={div}>
                        {div} gironi da {selectedParticipants.length / div} partecipanti
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number of Qualifiers */}
                <div className="space-y-2">
                  <label htmlFor="numQualifiers" className="text-sm font-bold text-slate-300">Qualificati per Girone</label>
                  <select
                    id="numQualifiers"
                    value={numQualifiers}
                    onChange={(e) => setNumQualifiers(Number(e.target.value))}
                    className="w-full bg-slate-800 border-2 border-slate-600 focus:border-[#F5A623] focus:ring-[#F5A623] rounded-none px-4 py-3 text-white"
                    disabled={numGroups === 0}
                  >
                    <option value={0} disabled>Seleziona i qualificati</option>
                    <option value={1}>1 qualificato</option>
                    <option value={2}>2 qualificati</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Opzione Fase Finale */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-300 tracking-wider uppercase">Fase Finale</label>
            <div className="flex items-center space-x-4 bg-[#0B132B] border-2 border-slate-700 p-4 rounded-none">
              <input type="checkbox" id="enableFinalPhase" checked={enableFinalPhase} onChange={(e) => setEnableFinalPhase(e.target.checked)} className="h-6 w-6 accent-[#F5A623]" />
              <label htmlFor="enableFinalPhase" className="text-white font-medium">Abilita fase finale ad eliminazione diretta</label>
            </div>
          </div>

          {/* Opzione Soglia */}
          <div className="space-y-2">
            <label htmlFor="threshold" className="text-sm font-bold text-slate-300 tracking-wider uppercase">Soglia Punti</label>
            <input
              type="number"
              id="threshold"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Es. 1000"
              className="w-full bg-[#0B132B] border-2 border-slate-700 focus:border-[#F5A623] focus:ring-[#F5A623] rounded-none px-4 py-3 text-white transition-colors placeholder:text-slate-500"
            />
          </div>

          {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}

          <div className="pt-6 border-t border-slate-700/50 flex flex-col items-end gap-4">
            {isSubmitDisabled && cupName.length > 0 && (
              <p className="text-yellow-400 text-sm text-right">
                Devi inserire un nome per la coppa e selezionare da 4 a 15 partecipanti.
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading || isSubmitDisabled}
              className="bg-gradient-to-r from-[#F5A623] to-[#D35400] text-white font-black tracking-widest uppercase px-8 py-3 rounded-none hover:opacity-90 transition-opacity shadow-[0_4px_15px_rgba(245,166,35,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
          participants: selectedParticipants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Qualcosa è andato storto durante l\'aggiornamento');
      }

      // Success
      handleCloseEdit();
      await fetchData(); // Refresh data

    } catch (err: any) {
      setFormError(err.message);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const renderCupEditingForm = () => (
    <div className="animate-fade-in">
      <button
        onClick={handleCloseEdit}
        className="flex items-center space-x-2 text-slate-300 hover:text-[#F5A623] transition-colors mb-8 group"
      >
        <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold tracking-wide">ANNULLA MODIFICHE</span>
      </button>

      <div className="bg-[#1C2541] border border-[#F5A623]/30 rounded-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] max-w-3xl mx-auto">
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
          {/* Participant Selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-300 tracking-wider uppercase">Partecipanti</label>
            {isLoadingParticipants ? (
              <div className="flex justify-center items-center h-24">
                <Loader className="h-8 w-8 text-[#F5A623] animate-spin" />
              </div>
            ) : fetchParticipantsError ? (
              <div className="text-center text-red-400">{fetchParticipantsError}</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-4 bg-[#0B132B] border-2 border-slate-700 rounded-none">
                  {leagueParticipants.map(p => (
                    <label key={p.username} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-[#F5A623] bg-slate-800"
                        checked={selectedParticipants.some(sp => sp.username === p.username)}
                        onChange={() => handleParticipantSelection(p)}
                        disabled={selectedParticipants.length >= 15 && !selectedParticipants.some(sp => sp.username === p.username)}
                      />
                      <span className="text-white">{p.username}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-slate-400">
                  Selezionati: {selectedParticipants.length} (min 4, max 15)
                </p>
              </>
            )}
          </div>


          {bracket && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 tracking-wider uppercase">Anteprima Tabellone</label>
              <BracketPreview bracket={bracket} />
            </div>
          )}

          {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}

          <div className="pt-6 border-t border-slate-700/50 flex items-center justify-end gap-4">
             <button
              type="submit"
              disabled={isLoading || selectedParticipants.length < 4 || selectedParticipants.length > 15}
              className="bg-gradient-to-r from-[#F5A623] to-[#D35400] text-white font-black tracking-widest uppercase px-8 py-3 rounded-none hover:opacity-90 transition-opacity shadow-[0_4px_15px_rgba(245,166,35,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderCupOverview = () => (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-[#F5A623] tracking-wider drop-shadow-sm uppercase">Coppa</h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Competizioni speciali a eliminazione e a punti.</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false); // Close edit view if open
            setEditingCup(null);
            setSelectedParticipants([]); // Reset selections
            setIsCreating(true);
          }}
          className="flex items-center space-x-3 bg-gradient-to-r from-[#F5A623] to-[#D35400] text-white font-black tracking-widest uppercase px-6 py-3 rounded-none hover:opacity-90 transition-opacity shadow-[0_4px_15px_rgba(245,166,35,0.2)]"
        >
          <Plus className="h-5 w-5" />
          <span>Crea Nuova Coppa</span>
        </button>
      </div>

      {isLoadingCups ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="h-12 w-12 text-[#F5A623] animate-spin" />
        </div>
      ) : fetchCupsError ? (
        <div className="text-center py-20 px-6 bg-red-900/20 border-2 border-dashed border-red-500/50 rounded-none">
          <h3 className="text-xl font-bold text-red-400">Errore</h3>
          <p className="text-red-300 mt-2">{fetchCupsError}</p>
        </div>
      ) : cups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cups.map((cup) => (
            <div key={cup.id} className="bg-[#1C2541]/80 border border-slate-700/50 rounded-none shadow-lg hover:border-[#F5A623]/50 transition-colors group flex flex-col justify-between">
              <div>
                <div className="relative">
                    <img 
                        src={cup.imageUrl}
                        alt={`Immagine ${cup.name}`}
                        className="w-full h-40 object-cover rounded-t-none"
                        onError={(e) => { e.currentTarget.src = 'https://img.icons8.com/plasticine/100/trophy.png'; }}
                    />
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-white group-hover:text-[#F5A623] transition-colors">{cup.name}</h3>
                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${cup.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                            {cup.status}
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-2">Creata il: {new Date(cup.creationDate).toLocaleDateString()}</p>
                    <div className="mt-4 flex items-center space-x-4 text-slate-300">
                        <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{cup.participants.length} Partecipanti</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Swords className="h-4 w-4" />
                            <span>{cup.matches.length} Match</span>
                        </div>
                    </div>
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="border-t border-slate-700/30 flex justify-end items-center gap-2 pt-4">
                    <button
                        onClick={() => handleManage(cup)}
                        className="text-slate-400 hover:text-white transition-colors p-2 rounded-full"
                        aria-label="Gestisci"
                        title="Gestisci"
                    >
                        <Settings className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(cup.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full"
                        aria-label="Elimina"
                        title="Elimina"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 bg-[#1C2541]/50 border-2 border-dashed border-slate-700 rounded-none">
          <Trophy className="h-16 w-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-300 tracking-wide">Nessuna coppa attiva</h3>
          <p className="text-slate-400 mt-2 max-w-md mx-auto">
            Sembra che non ci siano coppe in corso. Creane una per iniziare a competere con i tuoi amici in un formato diverso!
          </p>
        </div>
      )}
    </div>
  );

  return (
    <section>
      {isCreating ? renderCupCreationForm() : isEditing ? renderCupEditingForm() : renderCupOverview()}
    </section>
  );
};

export default CoppaPage;
