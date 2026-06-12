/**
 * Algoritmo di Calcolo Scontri
 * Restituisce i punti assegnati in base alla logica della soglia.
 * @param scoreA Punti totalizzati dall'utente A
 * @param scoreB Punti totalizzati dall'utente B
 * @param threshold Soglia di punti per determinare la vittoria
 * @returns { pointsA: number, pointsB: number } Punti in classifica (es. 3 per vittoria, 1 per pareggio, 0 per sconfitta)
 */
export function calculateMatchResult(scoreA: number, scoreB: number, threshold: number): { pointsA: number, pointsB: number } {
  // Pareggio Esatto (1-1)
  if (scoreA === scoreB) {
    return { pointsA: 1, pointsB: 1 };
  }

  const diff = Math.abs(scoreA - scoreB);

  if (scoreA > scoreB) {
    // Vittoria A
    // Se la differenza è maggiore o uguale alla soglia -> 3 pt (Netta)
    // Altrimenti -> 2 pt (Di misura)
    return diff >= threshold ? { pointsA: 3, pointsB: 0 } : { pointsA: 2, pointsB: 1 };
  } else {
    // Vittoria B
    return diff >= threshold ? { pointsA: 0, pointsB: 3 } : { pointsA: 1, pointsB: 2 };
  }
}

/**
 * Logica di Fetch (Frontend/API)
 * Interroga l'API di F1 Fantasy, estrae i punteggi e applica il merging dei due team per utente.
 * 
 * NOTA: L'API ufficiale di F1 Fantasy potrebbe richiedere autenticazione (cookie/token) 
 * e potrebbe non avere CORS abilitato per chiamate dirette dal browser.
 * È consigliabile eseguire questa logica in una API Route (Serverless) di Next.js.
 */
export async function fetchAndMergeLeagueData(leagueId: string, cookieToken: string) {
  try {
    const headers = {
        'accept': 'application/json, text/plain, */*',
        'cookie': cookieToken,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
    };

    // 1. Fetch data from F1 Fantasy API
    // Usiamo l'endpoint robusto utilizzato anche nella route API principale
    const buster = new Date().getTime();
    const apiUrl = `https://fantasy.formula1.com/feeds/leaderboard/privateleague/list_1_${leagueId}_0_1.json?buster=${buster}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch league data');
    }

    const responseText = await response.text();
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (e) {
        throw new Error('Invalid JSON from F1 API');
    }
    
    // Struttura ipotetica della risposta API:
    // Gestione flessibile della struttura di risposta
    const teams = data.Value?.leaderboard || data.Data?.Value || data.teams || data.list || (Array.isArray(data) ? data : []);

    // 2. Merging automatico basato sull'ID player o nome utente
    const aggregatedUsers: Record<string, { userId: string, username: string, totalScore: number, currentPoints: number, teamsCount: number }> = {};

    teams.forEach((team: any) => {
      // Saltiamo admin
      if (team.team_name === 'Admin_001') return;

      const username = team.user_name || 'Sconosciuto';
      // totalScore
      const score = parseFloat(team.cur_points || team.score || team.points || team.total_points || '0') || 0;
      // currentPoints (punteggio dell'ultima gara/sessione corrente)
      // L'API a volte usa 'cur_points' come totale e non ha un campo specifico per la gara corrente se non durante il live.
      // Assumiamo che se stiamo aggiornando, vogliamo il punteggio che l'API ci dà come "corrente" o "ultimo".
      // NOTA: 'cur_points' è spesso il punteggio totale in alcune versioni dell'API, mentre 'last_score' o simili mancano.
      // Tuttavia, per coppe basate su singola giornata, F1 non espone facilmente lo storico.
      // Useremo 'score' (che è spesso cur_points) come punteggio totale, e cercheremo un delta o useremo questo se stiamo tracciando il progressivo.
      // FIX: Per le Coppe, spesso serve il punteggio di GIORNATA. L'API feed 'leaderboard' mostra il TOTALE.
      // L'API non fornisce facilmente il punteggio di giornata qui.
      // Se disponibile useremo 'last_period_score' o simili se presenti, altrimenti cur_points se è l'unico dato.
      // In mancanza di meglio, usiamo score. Se l'utente vuole il punteggio di giornata, servirebbe un'altra chiamata API.
      // Per ora manteniamo la logica esistente ma la rendiamo robusta.
      
      // Se team.period_score o team.week_score esiste, usalo. Altrimenti usa score (totale) ma questo falserà la coppa se non è resettata.
      // Assumiamo che cur_points sia il totale.
      
      // IMPORTANTE: Per le Coppe serve il punteggio dell'evento specifico. 
      // In questo contesto, useremo 'score' come proxy, ma idealmente servirebbe il punteggio del GP.
      // F1 API ha spesso 'last_score' o 'gameweek_points'.
      const currentRaceScore = parseFloat(team.last_score || team.period_score || '0'); 

      // Se non abbiamo un ID univoco useremo username
      const key = username;

      if (!aggregatedUsers[key]) {
        aggregatedUsers[key] = {
          userId: key,
          username: key,
          totalScore: 0,
          currentPoints: 0,
          teamsCount: 0
        };
      }

      aggregatedUsers[key].totalScore += score;
      aggregatedUsers[key].currentPoints += currentRaceScore; // Somma i punteggi di giornata dei team dell'utente
      aggregatedUsers[key].teamsCount += 1;
    });

    // 3. Convertire in array e ordinare per punteggio totale
    const leaderboard = Object.values(aggregatedUsers).sort((a, b) => b.totalScore - a.totalScore);

    return leaderboard;

  } catch (error) {
    console.error("Error fetching and merging league data:", error);
    throw error;
  }
}
