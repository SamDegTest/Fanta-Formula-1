import { NextResponse } from 'next/server';

const LEAGUE_ID = '5525807';

// VARIABILE GLOBALE PER GLI HEADERS
// Modifica questa variabile se la chiamata API smette di funzionare
const F1_API_HEADERS: Record<string, string> = {
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
  'if-modified-since': 'Mon, 02 Mar 2026 18:19:28 GMT',
  'if-none-match': 'W/"99cdf48aea1d13c3de9b35bff51fd20b"',
  'newrelic': 'eyJ2IjpbMCwxXSwiZCI6eyJ0eSI6IkJyb3dzZXIiLCJhYyI6IjM4MDE3MTUiLCJhcCI6IjU1ODg1NzEwMCIsImlkIjoiMDFiMDg4Nzg0MmEwZWNiZCIsInRyIjoiNmI4ZTAyODdmZGRmOGQ2OTY5NjI0MTcwNDg3NWMyMjAiLCJ0aSI6MTc3MjQ3NTY1NjUwOCwidGsiOiIxODczMjk5In19',
  'priority': 'u=1, i',
  'referer': `https://fantasy.formula1.com/it/leagues/leaderboard/private/${LEAGUE_ID}`,
  'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'sec-gpc': '1',
  'traceparent': '00-6b8e0287fddf8d69696241704875c220-01b0887842a0ecbd-01',
  'tracestate': '1873299@nr=0-1-3801715-558857100-01b0887842a0ecbd----1772475656508',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
  // INSERISCI QUI IL TUO COOKIE COMPLETO
  'cookie': 'consentUUID=f8189e3f-5967-4789-ba61-a11899a8f6f6_53; consentDate=2026-03-02T16:34:44.130Z; login=%7B%22event%22:%22login%22,%22componentId%22:%22component_login_page%22,%22actionType%22:%22success%22%7D; login-session=%7B%22data%22%3A%7B%22subscriptionToken%22%3A%22eyJraWQiOiIxIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJFeHRlcm5hbEF1dGhvcml6YXRpb25zQ29udGV4dERhdGEiOiJJVEEiLCJGaXJzdE5hbWUiOiJTYW11ZWxlIiwiZW50cyI6W3siY291bnRyeSI6IklUQSIsImVudCI6IlJFRyJ9XSwidmVkIjoxLjc3MjczNDcxOUU5LCJTdWJzY3JpcHRpb25TdGF0dXMiOiJpbmFjdGl2ZSIsIlN1YnNjcmliZXJJZCI6IjIzMTc1NDk1NSIsIkxhc3ROYW1lIjoiRGUgR2lvcyIsImV4cCI6MTc3MjczNDcxOCwiU2Vzc2lvbklkIjoiZXlKaGJHY2lPaUpvZEhSd09pOHZkM2QzTG5jekxtOXlaeTh5TURBeEx6QTBMM2h0YkdSemFXY3RiVzl5WlNOb2JXRmpMWE5vWVRJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmlkU0k2SWpFd01ERXhJaXdpYzJraU9pSTJNR0U1WVdRNE5DMWxPVE5rTFRRNE1HWXRPREJrTmkxaFpqTTNORGswWmpKbE1qSWlMQ0pvZEhSd09pOHZjMk5vWlcxaGN5NTRiV3h6YjJGd0xtOXla'
};

export async function GET(request: Request) {
  try {
    // Nuovo endpoint per la classifica della lega privata
    // Il parametro buster serve per evitare la cache (usiamo un timestamp corrente)
    const buster = new Date().getTime();
    const apiUrl = `https://fantasy.formula1.com/feeds/leaderboard/privateleague/list_1_${LEAGUE_ID}_0_1.json?buster=${buster}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: F1_API_HEADERS
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("F1 API Error:", response.status, errorText);
        return NextResponse.json(
          { error: `Errore API F1: ${response.status}`, details: errorText }, 
          { status: response.status }
        );
      }

      const data = await response.json();
      
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
      if (
        fetchError.code === 'ENOTFOUND' || 
        (fetchError.cause && fetchError.cause.code === 'ENOTFOUND') ||
        fetchError.message.includes('fetch failed')
      ) {
        return NextResponse.json({ 
          error: "Errore di rete: Impossibile raggiungere l'API di F1 dal server.", 
          details: "Il server in cui è ospitata l'app (Google Cloud) ha restrizioni DNS per questo dominio. Il fallback sul client verrà attivato.",
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




