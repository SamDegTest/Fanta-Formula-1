import { NextResponse } from 'next/server';

const LEAGUE_ID = '5525807';

// VARIABILE GLOBALE PER GLI HEADERS
// Modifica questa variabile se la chiamata API smette di funzionare
const getF1Headers = () => {
  const cookie = process.env.F1_API_COOKIE;
  
  if (!cookie) {
    console.error("ERRORE CRITICO: Variabile d'ambiente F1_API_COOKIE mancante.");
  }

  return {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
    'priority': 'u=1, i',
    'referer': `https://fantasy.formula1.com/it/leagues/leaderboard/private/${LEAGUE_ID}`,
    'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'cookie': cookie || ''
  };
};

export async function GET(request: Request) {
  try {
    const headers = getF1Headers();
    
    // DEMO MODE FALLBACK: Se manca il cookie, restituiamo dati mockati per permettere di vedere l'app
    if (!headers.cookie) {
      console.warn("F1_API_COOKIE mancante. Attivazione DEMO MODE con dati mockati.");
      return NextResponse.json({ 
        success: true, 
        isDemoMode: true,
        leagueName: "PISTON LEAGUE (DEMO)",
        aggregated: [
          { rank: 1, username: "Federico Russo", totalScore: 450.5, teamsCount: 2, teams: [{ name: "AvvocatoSenior F1 team", score: 225.25 }, { name: "Team B", score: 225.25 }] },
          { rank: 2, username: "Domenico Ghionda", totalScore: 420.0, teamsCount: 2, teams: [{ name: "Habibi motorsport F1 team", score: 210.0 }, { name: "Team D", score: 210.0 }] },
          { rank: 3, username: "Raul Sisto", totalScore: 415.5, teamsCount: 2, teams: [{ name: "Legione del centauro", score: 207.75 }, { name: "Team F", score: 207.75 }] },
          { rank: 4, username: "Elena Russo", totalScore: 400.0, teamsCount: 2, teams: [{ name: "Nenacrochet", score: 200.0 }, { name: "Team H", score: 200.0 }] },
          { rank: 5, username: "Gianluca Tunzi", totalScore: 380.2, teamsCount: 2, teams: [{ name: "Tunzi Hyperflux Racing", score: 190.1 }, { name: "Team J", score: 190.1 }] }
        ],
        note: "Stai visualizzando dati DEMO perché la variabile d'ambiente F1_API_COOKIE non è configurata."
      });
    }

    // Nuovo endpoint per la classifica della lega privata
    // Il parametro buster serve per evitare la cache (usiamo un timestamp corrente)
    const buster = new Date().getTime();
    const apiUrl = `https://fantasy.formula1.com/feeds/leaderboard/privateleague/list_1_${LEAGUE_ID}_0_1.json?buster=${buster}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 secondi di timeout

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("F1 API Error:", response.status, errorText);
        return NextResponse.json(
          { error: `Errore API F1: ${response.status}`, details: errorText }, 
          { status: response.status }
        );
      }

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("F1 API non ha restituito JSON valido. Risposta:", responseText.substring(0, 200) + "...");
        return NextResponse.json(
          { error: "L'API di F1 ha restituito un formato non valido (probabilmente HTML invece di JSON). Controlla i cookie o l'autenticazione." }, 
          { status: 502 }
        );
      }
      
      // Aggregazione automatica basata sulla nuova struttura
      let aggregatedLeaderboard: any[] = [];
      try {
        // La nuova API restituisce i dati in data.Value.leaderboard
        const teams = data.Value?.leaderboard || data.Data?.Value || data.teams || data.list || (Array.isArray(data) ? data : []);
        
        if (teams && teams.length > 0) {
          const usersMap: Record<string, any> = {};
          
          teams.forEach((team: any) => {
            const teamName = team.team_name ? decodeURIComponent(team.team_name) : `Team ${team.team_no || ''}`;
            
            // REGOLA FISSA: Ignora sempre la squadra Admin_001
            if (teamName === 'Admin_001') {
              return; // Salta questa iterazione
            }

            const username = team.user_name || 'Sconosciuto';
            // cur_points potrebbe essere null prima dell'inizio della stagione
            const score = parseFloat(team.cur_points || team.score || team.points || team.total_points || '0') || 0;
            
            if (!usersMap[username]) {
              usersMap[username] = {
                username,
                totalScore: 0,
                teamsCount: 0,
                teams: []
              };
            }
            
            usersMap[username].totalScore += score;
            usersMap[username].teamsCount += 1;
            usersMap[username].teams.push({ 
              name: teamName, 
              score: score,
              team_no: team.team_no
            });
          });
          
          aggregatedLeaderboard = Object.values(usersMap).sort((a: any, b: any) => b.totalScore - a.totalScore);
          
          // Assegna la posizione (rank) dopo l'ordinamento
          aggregatedLeaderboard.forEach((user, index) => {
            user.rank = index + 1;
          });
        }
      } catch (e) {
        console.error("Errore durante l'aggregazione automatica:", e);
      }
      
      // Estrai il nome della lega se disponibile
      let leagueName = "PISTON LEAGUE"; // Default fallback
      if (data.Value?.league_name) {
        leagueName = decodeURIComponent(data.Value.league_name);
      } else if (data.Data?.Value?.league_name) {
        leagueName = decodeURIComponent(data.Data.Value.league_name);
      } else if (data.league_name) {
        leagueName = decodeURIComponent(data.league_name);
      }

      return NextResponse.json({ 
        success: true, 
        leagueName: leagueName,
        aggregated: aggregatedLeaderboard,
        raw_data: data 
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (
        fetchError.name === 'AbortError' ||
        fetchError.code === 'ENOTFOUND' || 
        (fetchError.cause && fetchError.cause.code === 'ENOTFOUND') ||
        fetchError.message.includes('fetch failed')
      ) {
        return NextResponse.json({ 
          error: "Errore di rete: Impossibile raggiungere l'API di F1 dal server (Timeout o Blocco IP).", 
          details: "Il server in cui è ospitata l'app (Google Cloud) ha restrizioni DNS o viene bloccato dai server di F1. Il fallback sul client verrà attivato.",
          isNetworkError: true,
          fallbackUrl: apiUrl
        }, { status: 502 });
      }
      throw fetchError;
    }

  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Errore interno del server", details: error.message }, { status: 500 });
  }
}




