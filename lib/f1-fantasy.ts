/**
 * Algoritmo di Calcolo Scontri
 * Restituisce i punti assegnati in base alla logica della soglia.
 * @param scoreA Punti totalizzati dall'utente A
 * @param scoreB Punti totalizzati dall'utente B
 * @param threshold Soglia di punti per determinare la vittoria
 * @returns { pointsA: number, pointsB: number } Punti in classifica (es. 3 per vittoria, 1 per pareggio, 0 per sconfitta)
 */
export function calculateMatchResult(scoreA: number, scoreB: number, threshold: number): { pointsA: number, pointsB: number } {
  const diff = scoreA - scoreB;

  if (Math.abs(diff) <= threshold) {
    // Pareggio
    return { pointsA: 1, pointsB: 1 };
  } else if (diff > threshold) {
    // Vittoria A
    return { pointsA: 3, pointsB: 0 };
  } else {
    // Vittoria B
    return { pointsA: 0, pointsB: 3 };
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
    // 1. Fetch data from F1 Fantasy API
    // Endpoint di esempio basato sulla documentazione Postman (potrebbe variare in base alla stagione)
    const response = await fetch(`https://fantasy-api.formula1.com/f1/2024/leagues/${leagueId}`, {
      headers: {
        'Cookie': cookieToken, // Necessario se la lega è privata
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch league data');
    }

    const data = await response.json();
    
    // Struttura ipotetica della risposta API:
    // data.league.teams = [{ id: 1, name: "Team 1", user: { id: "u1", name: "Mario" }, score: 150 }, ...]
    const apiTeams = data.league?.teams || [];

    // 2. Merging automatico basato sull'ID player o nome utente
    const aggregatedUsers: Record<string, { userId: string, username: string, totalScore: number, teamsCount: number }> = {};

    apiTeams.forEach((team: any) => {
      const userId = team.user.id;
      const username = team.user.name;
      const score = team.score || 0;

      if (!aggregatedUsers[userId]) {
        aggregatedUsers[userId] = {
          userId,
          username,
          totalScore: 0,
          teamsCount: 0
        };
      }

      aggregatedUsers[userId].totalScore += score;
      aggregatedUsers[userId].teamsCount += 1;
    });

    // 3. Convertire in array e ordinare per punteggio totale
    const leaderboard = Object.values(aggregatedUsers).sort((a, b) => b.totalScore - a.totalScore);

    return leaderboard;

  } catch (error) {
    console.error("Error fetching and merging league data:", error);
    throw error;
  }
}
