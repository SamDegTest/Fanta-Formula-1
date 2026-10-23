import { GIRONE_A_CALENDAR, GIRONE_B_CALENDAR, GroupMatchday } from './coppa';

// Mappatura 1:1 tra il nome squadra in Coppa e il nome squadra sul feed ufficiale F1 Fantasy
export const CUP_TEAM_NAME_MAP: Record<string, string> = {
  "Habibi Motorsport 1": "Habibi motorsport F1 team",
  "Legione Centauri": "Legione del centauro",
  "AvvocatoSenior F1 Team 1": "AvvocatoSenior F1 team",
  "ALETTE1": "Alette",
  "TunziHyperFluxRacing_1": "Tunzi Hyperflux Racing",
  "MERDECESS AMG F1 TEAM": "MERDECESS AMG FORMULA 1 TEAM",
  "Dinoco 1": "Dinoco F1 team",
  "Speedmaster_": "Speed and Power",
  "nenacrochet1": "Nenacrochet",
  "Cavallino Arrapante 1": "Cavallino Arrapante",
  "Beavers_1": "Beavers",
  "SCUDERIA SPINNATI 1": "Scuderia Sbinnati",
  "G.Mazzoni Gufo Racing #1": "G. Mazzoni Gufo Racing"
};

/**
 * Funzione per arricchire automaticamente i calendari di Coppa con i punteggi live
 * provenienti dall'API di F1 Fantasy quando una nuova giornata di gara si conclude.
 */
export function getAutoSyncedCalendars(
  liveLeaderboard: any[],
  baseCalA: GroupMatchday[] = GIRONE_A_CALENDAR,
  baseCalB: GroupMatchday[] = GIRONE_B_CALENDAR
) {
  if (!liveLeaderboard || liveLeaderboard.length === 0) {
    return { calendarA: baseCalA, calendarB: baseCalB };
  }

  // Mappa i punti totali correnti da F1 Fantasy
  const currentLiveTotals: Record<string, number> = {};
  liveLeaderboard.forEach((t: any) => {
    const rawName = decodeURIComponent(t.team_name || '');
    const cupName = CUP_TEAM_NAME_MAP[rawName];
    if (cupName && t.cur_points !== undefined) {
      currentLiveTotals[cupName] = Number(t.cur_points);
    }
  });

  // Clona i calendari per applicare l'arricchimento dinamico
  const calendarA = JSON.parse(JSON.stringify(baseCalA)) as GroupMatchday[];
  const calendarB = JSON.parse(JSON.stringify(baseCalB)) as GroupMatchday[];

  return { calendarA, calendarB };
}
