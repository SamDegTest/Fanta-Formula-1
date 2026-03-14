import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { generateBracket } from '@/lib/utils';
import { fetchAndMergeLeagueData, calculateMatchResult } from '@/lib/f1-fantasy';

// Helper function for Round-Robin Scheduling
// NOTA MATEMATICA:
// - Con N PARI (es. 4), servono N-1 turni (es. 3).
// - Con N DISPARI (es. 5), servono N turni (es. 5) perché a turno uno riposa.
// Questo spiega perché un girone da 5 ha 2 giornate in più di un girone da 4.
function generateRoundRobinSchedule(participants: any[]) {
    const schedule = [];
    const participantsCopy = [...participants];

    if (participantsCopy.length % 2 !== 0) {
        participantsCopy.push({ username: 'BYE' });
    }

    const numRounds = participantsCopy.length - 1;
    const halfSize = participantsCopy.length / 2;

    for (let round = 0; round < numRounds; round++) {
        const roundMatches = [];
        for (let i = 0; i < halfSize; i++) {
            const player1 = participantsCopy[i];
            const player2 = participantsCopy[participantsCopy.length - 1 - i];
            if (player1.username !== 'BYE' && player2.username !== 'BYE') {
                roundMatches.push([player1, player2]);
            }
        }
        schedule.push(roundMatches);

        // Rotate participants for the next round
        const last = participantsCopy.pop();
        if (last) {
            participantsCopy.splice(1, 0, last);
        }
    }
    return schedule;
}

async function generateCupMatches(cupId: string, participants: any[], settings: any, giornataInizio: string) {
    const matches: any[] = [];
    
    const currentYear = new Date().getFullYear();
    const calendarResponse = await fetch(`https://api.openf1.org/v1/sessions?session_type=Race&year=${currentYear}`);
    if (!calendarResponse.ok) {
        throw new Error('Failed to fetch calendar data from OpenF1 for match generation');
    }
    const calendar: any[] = await calendarResponse.json();
    const raceEvents = calendar.sort((a,b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
    const startIndex = raceEvents.findIndex(race => race.session_key === parseInt(giornataInizio));

    if (startIndex === -1) {
        throw new Error('La giornata di inizio selezionata non è valida per la generazione dei match.');
    }

    const bracket = generateBracket(participants, settings);
    let raceIndex = startIndex;

    if (bracket && bracket.groups && bracket.groups.length > 0) {
        // Genera i calendari per TUTTI i gironi individualmente
        const groupSchedules = bracket.groups.map((group: any) => {
            return generateRoundRobinSchedule(group.participants);
        });

        // Trova il numero massimo di turni necessari (determinato dal girone più numeroso)
        const maxRounds = Math.max(...groupSchedules.map((s: any[]) => s.length));

        for (let roundIdx = 0; roundIdx < maxRounds; roundIdx++) {
            const roundRace = raceEvents[raceIndex];
            if (!roundRace) {
                console.warn(`Warning: Not enough future races in the calendar to schedule group stage round ${roundIdx + 1}.`);
                break;
            }

            // Itera su ogni girone e aggiungi i match se il girone ha una giornata roundIdx
            bracket.groups.forEach((group: any, groupIndex: number) => {
                const schedule = groupSchedules[groupIndex];
                
                // Se il girone ha partite per questa giornata, aggiungile
                if (roundIdx < schedule.length) {
                    const roundMatches = schedule[roundIdx];
                    roundMatches.forEach((matchPair: any) => {
                        matches.push({
                            id: `${cupId}-m${matches.length + 1}`,
                            cup_id: cupId,
                            race_id: roundRace.session_key,
                            round: `${group.name} - Giornata ${roundIdx + 1}`,
                            user_a_id: matchPair[0].username,
                            user_b_id: matchPair[1].username,
                            score_a: null,
                            score_b: null,
                            status: 'SCHEDULED'
                        });
                    });
                }
                // Se roundIdx >= schedule.length, questo girone ha finito (pausa) mentre gli altri continuano
            });
            raceIndex++;
        }
    }

    if (bracket && bracket.knockout && bracket.knockout.rounds) {
      bracket.knockout.rounds.forEach((round: any) => {
        const race = raceEvents[raceIndex];
        if (race) {
          round.matches.forEach((match: any) => {
            matches.push({ id: `${cupId}-m${matches.length + 1}`, cup_id: cupId, race_id: race.session_key, round: round.name, user_a_id: match.player1.username, user_b_id: match.player2?.username || 'BYE', score_a: null, score_b: null, status: 'SCHEDULED' });
          });
          raceIndex++;
        } else {
             console.warn(`Warning: Not enough future races in the calendar to schedule knockout round ${round.name}.`);
        }
      });
    }
    return matches;
}

export async function POST(request: Request) {
  try {
    const { cupName, participants, settings, giornataInizio } = await request.json();

    // --- Validation ---
    if (!cupName || typeof cupName !== 'string' || cupName.length < 3) {
      return NextResponse.json({ error: 'Il nome della coppa deve essere di almeno 3 caratteri.' }, { status: 400 });
    }
    if (!participants || !Array.isArray(participants) || participants.length < 4) {
      return NextResponse.json({ error: 'Sono richiesti almeno 4 partecipanti.' }, { status: 400 });
    }
    if (!giornataInizio) {
      return NextResponse.json({ error: 'La giornata di inizio è obbligatoria.' }, { status: 400 });
    }

    const id = cupName.toLowerCase().replace(/\s+/g, '-');
    const cupId = `cup:${id}`;

    const existingCup = await kv.get(cupId);
    if (existingCup) {
        return NextResponse.json({ error: 'Una coppa con questo nome esiste già.' }, { status: 409 });
    }

    const matches = await generateCupMatches(cupId, participants, settings, giornataInizio);

    const newCup = {
      id: cupId,
      league_id: process.env.LEAGUE_ID, // Link to league
      name: cupName,
      creationDate: new Date().toISOString(),
      imageUrl: `/api/drive-images?type=cup&name=${cupName}`,
      settings: settings,
      giornata_inizio: giornataInizio,
      participants: participants || [],
      matches: matches,
      status: 'APERTA'
    };

    await kv.set(cupId, newCup);

    return NextResponse.json({ message: 'Coppa creata con successo!', cup: newCup }, { status: 201 });

  } catch (error) {
    console.error('Errore nella creazione della coppa:', error);
    return NextResponse.json({ error: 'Si è verificato un errore interno. Riprova più tardi.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const forceUpdate = searchParams.get('update') === 'true'; // Opzionale: forzare aggiornamento

        if (id) {
            const cupId = `cup:${id}`;
            const cup:any = await kv.get(cupId);

            if (!cup) {
                return NextResponse.json({ error: 'Coppa non trovata.' }, { status: 404 });
            }

            let needsSave = false;
            let liveData: any[] | null = null;

            // Enrich matches with race information
            if (cup.matches && cup.matches.length > 0) {
                const cupYear = new Date(cup.creationDate).getFullYear();

                const calendarCacheKey = `calendar:${cupYear}:race`;
                let calendar: any[] | null = await kv.get(calendarCacheKey);

                if (!calendar) {
                    const calendarResponse = await fetch(`https://api.openf1.org/v1/sessions?session_type=Race&year=${cupYear}`);
                    if (calendarResponse.ok) {
                        calendar = await calendarResponse.json();
                        await kv.set(calendarCacheKey, calendar, { ex: 86400 }); // Cache for 1 day
                    }
                }
                
                if (calendar) {
                    const raceInfoMap = new Map(calendar.map((race: any) => [String(race.session_key), race]));
                    
                    const now = new Date();

                    cup.matches = cup.matches.map((match: any) => ({
                        ...match,
                        race_info: raceInfoMap.get(String(match.race_id)) || null,
                    }));

                    // CHECK FOR UPDATES
                    // Identifica match che sono SCHEDULED ma la cui gara è finita (o iniziata da tempo)
                    const pendingMatches = cup.matches.filter((m: any) => {
                        if (m.status === 'COMPLETED') return false;
                        if (!m.race_info) return false;
                        const raceEnd = new Date(m.race_info.date_end);
                        // Aggiungiamo un buffer di 4 ore dopo la fine della gara per essere sicuri che i punteggi siano usciti
                        const scoresAvailableTime = new Date(raceEnd.getTime() + 4 * 60 * 60 * 1000); 
                        return now > scoresAvailableTime;
                    });

                    if (pendingMatches.length > 0) {
                        try {
                            const LEAGUE_ID = process.env.LEAGUE_ID;
                            const COOKIE = process.env.F1_API_COOKIE;
                            
                            if (LEAGUE_ID && COOKIE) {
                                const liveDataCacheKey = `livedata:${LEAGUE_ID}`;
                                liveData = await kv.get(liveDataCacheKey);

                                if (!liveData) {
                                    liveData = await fetchAndMergeLeagueData(LEAGUE_ID, COOKIE);
                                    if (liveData && liveData.length > 0) {
                                        await kv.set(liveDataCacheKey, liveData, { ex: 600 }); // Cache for 10 minutes
                                    }
                                }

                                if (liveData) {
                                    const userPointsMap = new Map(liveData.map((u: any) => [u.username, u.currentPoints]));

                                    // Update matches
                                    pendingMatches.forEach((match: any) => {
                                        if (match.user_a_id === 'BYE' || match.user_b_id === 'BYE') return;

                                        const scoreA = userPointsMap.get(match.user_a_id);
                                        const scoreB = userPointsMap.get(match.user_b_id);

                                        if (scoreA !== undefined && scoreB !== undefined) {
                                            match.score_a = scoreA;
                                            match.score_b = scoreB;
                                            match.status = 'COMPLETED';
                                            needsSave = true;
                                        }
                                    });
                                }
                            }
                        } catch (e) {
                            console.error("Failed to fetch live F1 data for cup update:", e);
                        }
                    }
                }
            }

            // RECALCULATE STANDINGS (Se ci sono stati aggiornamenti)
            if (needsSave && cup.participants) {
                const threshold = cup.settings?.scoreThreshold || 0;

                // Reset stats
                cup.participants.forEach((p: any) => {
                    p.score = 0; // Punti classifica (3, 2, 1, 0)
                    p.f1_points = 0; // Totale punti F1
                });

                // Apply results from ALL completed matches
                cup.matches.forEach((m: any) => {
                    if (m.status === 'COMPLETED' && m.score_a !== null && m.score_b !== null && m.user_a_id !== 'BYE' && m.user_b_id !== 'BYE') {
                        const result = calculateMatchResult(m.score_a, m.score_b, threshold);
                        
                        const pA = cup.participants.find((p: any) => p.username === m.user_a_id);
                        const pB = cup.participants.find((p: any) => p.username === m.user_b_id);

                        if (pA) { pA.score = (pA.score || 0) + result.pointsA; pA.f1_points = (pA.f1_points || 0) + m.score_a; }
                        if (pB) { pB.score = (pB.score || 0) + result.pointsB; pB.f1_points = (pB.f1_points || 0) + m.score_b; }
                    }
                });

                // SAVE TO DB
                await kv.set(cupId, cup);
            }

            // CALCOLO STATO DINAMICO
            // APERTA: Nessun match completato
            // IN CORSO: Almeno un match completato ma non tutti
            // TERMINATA: Tutti i match completati
            const totalMatches = cup.matches.length;
            const completedMatches = cup.matches.filter((m: any) => m.status === 'COMPLETED').length;

            if (completedMatches === 0) {
                cup.status = 'APERTA';
            } else if (completedMatches === totalMatches && totalMatches > 0) {
                cup.status = 'TERMINATA';
            } else {
                cup.status = 'IN CORSO';
            }

            return NextResponse.json(cup, { status: 200 });
        } else {
            const cupIds = await kv.keys('cup:*');
            if (cupIds.length === 0) {
                return NextResponse.json([], { status: 200 });
            }
            const cups = await kv.mget(...cupIds);
            
            // Calcolo stato dinamico per la lista
            const cupsWithStatus = cups.map((c: any) => {
                const total = c.matches?.length || 0;
                const completed = c.matches?.filter((m: any) => m.status === 'COMPLETED').length || 0;
                
                if (completed === 0) c.status = 'APERTA';
                else if (completed === total && total > 0) c.status = 'TERMINATA';
                else c.status = 'IN CORSO';
                
                return c;
            });

            return NextResponse.json(cupsWithStatus, { status: 200 });
        }

    } catch (error) {
        console.error("Errore nel recupero delle coppe:", error);
        return NextResponse.json({ error: 'Si è verificato un errore interno. Riprova più tardi.' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, cupName, giornataInizio, participants, settings } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'L\'ID della coppa è obbligatorio per l\'aggiornamento.' }, { status: 400 });
        }

        const cupId = `cup:${id}`;
        const cup: any = await kv.get(cupId);

        if (!cup) {
            return NextResponse.json({ error: 'Coppa non trovata.' }, { status: 404 });
        }

        // Update basic info
        if (cupName) {
            cup.name = cupName;
            cup.imageUrl = `/api/drive-images?type=cup&name=${cupName}`;
        }

        // START: Validation for giornataInizio change
        if (giornataInizio && giornataInizio !== cup.giornata_inizio) {
            const cupYear = new Date(cup.creationDate).getFullYear();
            const calendarResponse = await fetch(`https://api.openf1.org/v1/sessions?session_type=Race&year=${cupYear}`);
            if (!calendarResponse.ok) {
                return NextResponse.json({ error: 'Impossibile recuperare il calendario per la validazione.' }, { status: 500 });
            }
            const calendar: any[] = await calendarResponse.json();
            const raceEvents = calendar.sort((a,b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());

            const originalRace = raceEvents.find(race => race.session_key === parseInt(cup.giornata_inizio));
            const newRace = raceEvents.find(race => race.session_key === parseInt(giornataInizio));

            if (originalRace) {
                const originalRaceDate = new Date(originalRace.date_start);
                const now = new Date();
                const oneDay = 24 * 60 * 60 * 1000;
                
                // Allow changes only if the race is more than 1 day away
                if (originalRaceDate.getTime() - now.getTime() <= oneDay) {
                    return NextResponse.json({ error: 'La giornata di inizio può essere modificata solo fino a 1 giorno prima del suo inizio.' }, { status: 400 });
                }

                // Allow only postponement
                if (newRace && new Date(newRace.date_start) < originalRaceDate) {
                    return NextResponse.json({ error: 'La nuova giornata di inizio non può essere precedente a quella attuale.' }, { status: 400 });
                }

                if (newRace) {
                    cup.dateChangeInfo = {
                        from: {
                            meeting_name: originalRace.meeting_name,
                            country_name: originalRace.country_name,
                            date_start: originalRace.date_start,
                        },
                        to: {
                            meeting_name: newRace.meeting_name,
                            country_name: newRace.country_name,
                            date_start: newRace.date_start,
                        },
                        showDateChangeBanner: true,
                    };
                }
            }
        }
        // END: Validation for giornataInizio change

        const hasStructuralChanges = (
            (participants && JSON.stringify(participants) !== JSON.stringify(cup.participants)) ||
            (settings && JSON.stringify(settings) !== JSON.stringify(cup.settings)) ||
            (giornataInizio && giornataInizio !== cup.giornata_inizio)
        );

        if (participants) cup.participants = participants;
        if (giornataInizio) cup.giornata_inizio = giornataInizio;
        if (settings) cup.settings = { ...cup.settings, ...settings };

        // If structural changes are detected, regenerate the matches.
        if (hasStructuralChanges) {
            cup.matches = await generateCupMatches(cupId, cup.participants, cup.settings, cup.giornata_inizio);
            // Reset participant scores if the bracket changes
            cup.participants.forEach((p: any) => { p.score = 0; p.f1_points = 0; });
        }

        await kv.set(cupId, cup);

        return NextResponse.json({ message: 'Coppa aggiornata con successo!', cup }, { status: 200 });

    } catch (error) {
        console.error("Errore nell'aggiornamento della coppa:", error);
        return NextResponse.json({ error: 'Si è verificato un errore interno. Riprova più tardi.' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id, adminPassword } = await request.json();
        
        if (adminPassword !== 'soloiopossofarlo') {
            return NextResponse.json({ error: 'Password di amministrazione non corretta.' }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: 'L\'ID della coppa è obbligatorio per l\'eliminazione.' }, { status: 400 });
        }

        const cupId = `cup:${id}`;
        const cup: any = await kv.get(cupId);

        if (!cup) {
            return NextResponse.json({ error: 'Coppa non trovata.' }, { status: 404 });
        }

        await kv.del(cupId);

        return NextResponse.json({ message: 'Coppa eliminata con successo!' }, { status: 200 });

    } catch (error) {
        console.error("Errore nell'eliminazione della coppa:", error);
        return NextResponse.json({ error: 'Si è verificato un errore interno. Riprova più tardi.' }, { status: 500 });
    }
}
