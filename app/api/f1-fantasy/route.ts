import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Forza la route ad essere dinamica per evitare che Next.js la "congeli" (Static Generation)
export const dynamic = 'force-dynamic';

const LEAGUE_ID = process.env.LEAGUE_ID;

// VARIABILE GLOBALE PER GLI HEADERS
// Modifica questa variabile se la chiamata API smette di funzionare
const getF1Headers = (req?: Request) => {
  const envCookie = process.env.F1_API_COOKIE;
  const reqCookie = req ? req.headers.get('cookie') : null;
  // Se la richiesta web ha già i veri cookie di F1 (es: siamo in prod dietro proxy sullo stesso dominio), usa quelli.
  // Altrimenti, sul server locale, il browser invierà cookie di localhost che non servono all'API di F1,
  // quindi in quel caso facciamo fallback sulla variabile d'ambiente.
  let cookie = envCookie || '';
  if (reqCookie && reqCookie.includes('F1_FANTASY_007')) {
    cookie = reqCookie;
  }
  
  if (!cookie) {
    console.error("ERRORE CRITICO: Cookie F1 mancante.");
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
    const headers = getF1Headers(request);
    
    if (!headers.cookie) {
      return NextResponse.json(
        { 
          error: "Configurazione mancante: F1_API_COOKIE non trovato nelle variabili d'ambiente.",
          needsConfig: true 
        }, 
        { status: 401 }
      );
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
                teams: [],
                user_guid: team.user_guid || null
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
          
          // Recuperiamo i booster in parallelo per ogni utente
          const mdid = data.Data?.Value?.CurrentRace?.MatchDayId || data.Value?.CurrentRace?.MatchDayId || data.Data?.Value?.mdid || data.Value?.mdid || 2;
          
          // Mappatura ipotetica dei booster basata su f1 fantasy storici: 6 = x3
          const boosterMappings: Record<number, string> = {
            2: 'limitless',
            3: 'wildcard',
            4: 'final_fix',
            5: 'no_negative',
            6: 'extra_drs',
            7: 'autopilot'
          };

          const opponentPromises = aggregatedLeaderboard.map(async (user) => {
            if (!user.user_guid || user.teams.length === 0) return;
            
            const teamNo = user.teams[0].team_no || 1;
            const busterVal = new Date().getTime();
            const opponentUrl = `https://fantasy.formula1.com/services/user/opponentteam/opponentgamedayplayerteamget/1/${user.user_guid}/1/${mdid}/${teamNo}?buster=${busterVal}`;
            
            try {
              // Creiamo un AbortController specifico per ogni chiamata
              const oppController = new AbortController();
              const oppTimeout = setTimeout(() => oppController.abort(), 4000); // 4 secondi timeout per la sotto-chiamata
              
              const oppResponse = await fetch(opponentUrl, {
                method: 'GET',
                headers: headers,
                signal: oppController.signal
              });
              
              clearTimeout(oppTimeout);
              
              if (oppResponse.ok) {
                const oppData = await oppResponse.json();
                const userTeamData = oppData.Data?.Value?.userTeam?.[0];
                if (userTeamData && userTeamData.boosterid) {
                  const bId = userTeamData.boosterid;
                  user.applied_booster = boosterMappings[bId] || `id_${bId}`;
                }
              }
            } catch (e) {
              console.error(`Errore fetch booster per ${user.username}:`, e);
            }
          });

          // Aspettiamo che tutte le chiamate ai booster finiscano
          await Promise.allSettled(opponentPromises);
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
      }, {
        headers: {
          // Cache CDN: 60 secondi di freschezza assoluta, poi serve dati "vecchi" per 5 minuti mentre aggiorna in background
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
        }
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
