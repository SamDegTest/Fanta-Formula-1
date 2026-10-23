export type CupMatch = {
  id?: string;
  matchday: number;
  gpName: string;
  teamA: string;
  teamB: string;
  scoreA?: number | null;
  scoreB?: number | null;
  restingTeam?: string;
};

export type GroupStandings = {
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  diffPoints: number;
  cupPoints: number;
};

export const GIRONE_A_TEAMS = [
  "MERDECESS AMG FORMULA 1 TEAM",
  "G. Mazzoni Gufo Racing",
  "Cavallino Arrapante",
  "Legione del centauro",
  "AvvocatoSenior F1 team",
  "Beavers",
  "Habibi motorsport F1 team"
];

export const GIRONE_B_TEAMS = [
  "Scuderia Sbinnati",
  "Speed and Power",
  "Tunzi Hyperflux Racing",
  "Nenacrochet",
  "Dinoco F1 team",
  "Alette"
];

// Calendario 7 Giornate per Girone A (7 squadre: 3 scontri + 1 riposo ad ogni giornata)
// Nota: G. Bretagna (05/07), Olanda (23/08) e Singapore (11/10) sono PAUSA COPPA
export const GIRONE_A_CALENDAR: GroupMatchday[] = [
  {
    matchday: 1,
    gpName: "SPAGNA 1",
    date: "14/06",
    restingTeam: "Habibi motorsport F1 team",
    matches: [
      { teamA: "Legione del centauro", teamB: "G. Mazzoni Gufo Racing", scoreA: 263, scoreB: 269 },
      { teamA: "AvvocatoSenior F1 team", teamB: "Cavallino Arrapante", scoreA: 212, scoreB: 240 },
      { teamA: "Beavers", teamB: "MERDECESS AMG FORMULA 1 TEAM", scoreA: 192, scoreB: 241 }
    ]
  },
  {
    matchday: 2,
    gpName: "AUSTRIA",
    date: "28/06",
    restingTeam: "Cavallino Arrapante",
    matches: [
      { teamA: "Habibi motorsport F1 team", teamB: "G. Mazzoni Gufo Racing", scoreA: 469, scoreB: 314 },
      { teamA: "Legione del centauro", teamB: "MERDECESS AMG FORMULA 1 TEAM", scoreA: 403, scoreB: 428 },
      { teamA: "AvvocatoSenior F1 team", teamB: "Beavers", scoreA: 427, scoreB: 420 }
    ]
  },
  {
    matchday: 3,
    gpName: "BELGIO",
    date: "19/07",
    restingTeam: "Beavers",
    matches: [
      { teamA: "Habibi motorsport F1 team", teamB: "Cavallino Arrapante", scoreA: 454, scoreB: 267 },
      { teamA: "G. Mazzoni Gufo Racing", teamB: "MERDECESS AMG FORMULA 1 TEAM", scoreA: 293, scoreB: 381 },
      { teamA: "Legione del centauro", teamB: "AvvocatoSenior F1 team", scoreA: 420, scoreB: 409 }
    ]
  },
  {
    matchday: 4,
    gpName: "UNGHERIA",
    date: "26/07",
    restingTeam: "Legione del centauro",
    matches: [
      { teamA: "Habibi motorsport F1 team", teamB: "MERDECESS AMG FORMULA 1 TEAM", scoreA: 424, scoreB: 461 },
      { teamA: "Cavallino Arrapante", teamB: "Beavers", scoreA: 537, scoreB: 413 },
      { teamA: "G. Mazzoni Gufo Racing", teamB: "AvvocatoSenior F1 team", scoreA: 329, scoreB: 439 }
    ]
  },
  {
    matchday: 5,
    gpName: "ITALIA",
    date: "06/09",
    restingTeam: "G. Mazzoni Gufo Racing",
    matches: [
      { teamA: "MERDECESS AMG FORMULA 1 TEAM", teamB: "AvvocatoSenior F1 team", scoreA: 628, scoreB: 746 },
      { teamA: "Cavallino Arrapante", teamB: "Legione del centauro", scoreA: 708, scoreB: 553 },
      { teamA: "Habibi motorsport F1 team", teamB: "Beavers", scoreA: 706, scoreB: 345 }
    ]
  },
  {
    matchday: 6,
    gpName: "SPAGNA 2",
    date: "13/09",
    restingTeam: "AvvocatoSenior F1 team",
    matches: [
      { teamA: "MERDECESS AMG FORMULA 1 TEAM", teamB: "Cavallino Arrapante", scoreA: 357, scoreB: 395 },
      { teamA: "Habibi motorsport F1 team", teamB: "Legione del centauro", scoreA: 318, scoreB: 343 },
      { teamA: "G. Mazzoni Gufo Racing", teamB: "Beavers", scoreA: 150, scoreB: 335 }
    ]
  },
  {
    matchday: 7,
    gpName: "AZERBAIGIAN",
    date: "26/09",
    restingTeam: "MERDECESS AMG FORMULA 1 TEAM",
    matches: [
      { teamA: "Habibi motorsport F1 team", teamB: "AvvocatoSenior F1 team", scoreA: 427, scoreB: 313 },
      { teamA: "G. Mazzoni Gufo Racing", teamB: "Cavallino Arrapante", scoreA: 215, scoreB: 423 },
      { teamA: "Legione del centauro", teamB: "Beavers", scoreA: 287, scoreB: 421 }
    ]
  }
];

// Calendario 5 Giornate per Girone B (6 squadre: 3 scontri per giornata, nessun riposo)
export const GIRONE_B_CALENDAR: GroupMatchday[] = [
  {
    matchday: 1,
    gpName: "SPAGNA 1",
    date: "14/06",
    matches: [
      { teamA: "Tunzi Hyperflux Racing", teamB: "Nenacrochet", scoreA: 178, scoreB: 153 },
      { teamA: "Alette", teamB: "Scuderia Sbinnati", scoreA: 185, scoreB: 298 },
      { teamA: "Dinoco F1 team", teamB: "Speed and Power", scoreA: 205, scoreB: 250 }
    ]
  },
  {
    matchday: 2,
    gpName: "AUSTRIA",
    date: "28/06",
    matches: [
      { teamA: "Tunzi Hyperflux Racing", teamB: "Scuderia Sbinnati", scoreA: 449, scoreB: 320 },
      { teamA: "Nenacrochet", teamB: "Speed and Power", scoreA: 412, scoreB: 450 },
      { teamA: "Alette", teamB: "Dinoco F1 team", scoreA: 434, scoreB: 386 }
    ]
  },
  {
    matchday: 3,
    gpName: "BELGIO",
    date: "19/07",
    matches: [
      { teamA: "Tunzi Hyperflux Racing", teamB: "Speed and Power", scoreA: 486, scoreB: 384 },
      { teamA: "Scuderia Sbinnati", teamB: "Dinoco F1 team", scoreA: 331, scoreB: 355 },
      { teamA: "Nenacrochet", teamB: "Alette", scoreA: 388, scoreB: 475 }
    ]
  },
  {
    matchday: 4,
    gpName: "UNGHERIA",
    date: "26/07",
    matches: [
      { teamA: "Tunzi Hyperflux Racing", teamB: "Dinoco F1 team", scoreA: 442, scoreB: 385 },
      { teamA: "Speed and Power", teamB: "Alette", scoreA: 407, scoreB: 384 },
      { teamA: "Scuderia Sbinnati", teamB: "Nenacrochet", scoreA: 411, scoreB: 402 }
    ]
  },
  {
    matchday: 5,
    gpName: "ITALIA",
    date: "06/09",
    matches: [
      { teamA: "Tunzi Hyperflux Racing", teamB: "Alette", scoreA: 662, scoreB: 766 },
      { teamA: "Speed and Power", teamB: "Scuderia Sbinnati", scoreA: 592, scoreB: 420 },
      { teamA: "Nenacrochet", teamB: "Dinoco F1 team", scoreA: 634, scoreB: 538 }
    ]
  }
];

export const CUP_TIMELINE = [
  { gp: "SPAGNA 1", date: "14/06", stage: "GIRONE", round: 1, isPlayed: true, label: "GIRONE 1" },
  { gp: "AUSTRIA", date: "28/06", stage: "GIRONE", round: 2, isPlayed: true, label: "GIRONE 2" },
  { gp: "G. BRETAGNA", date: "05/07", stage: "PAUSA", round: 3, isPlayed: true, label: "PAUSA" },
  { gp: "BELGIO", date: "19/07", stage: "GIRONE", round: 4, isPlayed: true, label: "GIRONE 3" },
  { gp: "UNGHERIA", date: "26/07", stage: "GIRONE", round: 5, isPlayed: true, label: "GIRONE 4" },
  { gp: "OLANDA", date: "23/08", stage: "PAUSA", round: 6, isPlayed: true, label: "PAUSA" },
  { gp: "ITALIA", date: "06/09", stage: "GIRONE", round: 7, isPlayed: true, label: "GIRONE 5" },
  { gp: "SPAGNA 2", date: "13/09", stage: "GIRONE", round: 8, isPlayed: true, label: "GIRONE 6" },
  { gp: "AZERBAIGIAN", date: "26/09", stage: "GIRONE", round: 9, isPlayed: true, label: "GIRONE 7 (A)" },
  { gp: "SINGAPORE", date: "11/10", stage: "PAUSA", round: 10, isPlayed: true, label: "PAUSA" },
  { gp: "STATI UNITI", date: "25/10", stage: "QUARTI", round: 11, isPlayed: false, label: "QUARTI" },
  { gp: "MESSICO", date: "01/11", stage: "QUARTI", round: 12, isPlayed: false, label: "QUARTI" },
  { gp: "BRASILE", date: "08/11", stage: "SEMIFINALE", round: 13, isPlayed: false, label: "SEMIFINALE" },
  { gp: "LAS VEGAS", date: "22/11", stage: "SEMIFINALE", round: 14, isPlayed: false, label: "SEMIFINALE" },
  { gp: "QATAR", date: "29/11", stage: "PAUSA", round: 15, isPlayed: false, label: "PAUSA" },
  { gp: "ABU DHABI", date: "06/12", stage: "FINALE", round: 16, isPlayed: false, label: "FINALE" }
];

export function calculateCupMatchResult(scoreA: number | null | undefined, scoreB: number | null | undefined) {
  if (scoreA === null || scoreA === undefined || scoreB === null || scoreB === undefined) {
    return null;
  }

  const diff = scoreA - scoreB;
  const absDiff = Math.abs(diff);

  let ptsA = 0;
  let ptsB = 0;
  let summary = "";

  if (diff > 0) {
    if (diff >= 40) {
      ptsA = 3;
      ptsB = 0;
      summary = `vince 3-0`;
    } else {
      ptsA = 2;
      ptsB = 1;
      summary = `vince 2-1`;
    }
  } else if (diff < 0) {
    if (absDiff >= 40) {
      ptsA = 0;
      ptsB = 3;
      summary = `vince 3-0`;
    } else {
      ptsA = 1;
      ptsB = 2;
      summary = `vince 2-1`;
    }
  } else {
    ptsA = 1;
    ptsB = 1;
    summary = `pareggio 1-1`;
  }

  return {
    ptsA,
    ptsB,
    diff: absDiff,
    winner: diff > 0 ? 'A' : diff < 0 ? 'B' : 'DRAW',
    summary
  };
}

export type GroupMatchday = {
  matchday: number;
  gpName: string;
  date: string;
  restingTeam?: string;
  matches: {
    teamA: string;
    teamB: string;
    scoreA: number | null;
    scoreB: number | null;
  }[];
};

export function calculateGroupStandings(teams: string[], calendar: GroupMatchday[]): GroupStandings[] {
  const standingsMap: Record<string, GroupStandings> = {};

  teams.forEach(team => {
    standingsMap[team] = {
      teamName: team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      diffPoints: 0,
      cupPoints: 0
    };
  });

  calendar.forEach(giornata => {
    giornata.matches.forEach(m => {
      if (m.scoreA !== null && m.scoreA !== undefined && m.scoreB !== null && m.scoreB !== undefined) {
        const res = calculateCupMatchResult(m.scoreA, m.scoreB);
        if (res && standingsMap[m.teamA] && standingsMap[m.teamB]) {
          const stA = standingsMap[m.teamA];
          const stB = standingsMap[m.teamB];

          stA.played += 1;
          stB.played += 1;

          stA.pointsFor += m.scoreA;
          stA.pointsAgainst += m.scoreB;

          stB.pointsFor += m.scoreB;
          stB.pointsAgainst += m.scoreA;

          stA.cupPoints += res.ptsA;
          stB.cupPoints += res.ptsB;

          if (res.winner === 'A') {
            stA.won += 1;
            stB.lost += 1;
          } else if (res.winner === 'B') {
            stB.won += 1;
            stA.lost += 1;
          } else {
            stA.drawn += 1;
            stB.drawn += 1;
          }
        }
      }
    });
  });

  Object.values(standingsMap).forEach(st => {
    st.diffPoints = st.pointsFor - st.pointsAgainst;
  });

  return Object.values(standingsMap).sort((a, b) => {
    // 1. Punti in classifica
    if (b.cupPoints !== a.cupPoints) return b.cupPoints - a.cupPoints;

    // 2. Scontro diretto tra le squadre a pari punti
    let h2hA = 0;
    let h2hB = 0;
    calendar.forEach(giornata => {
      giornata.matches.forEach(m => {
        if (
          (m.teamA === a.teamName && m.teamB === b.teamName) ||
          (m.teamA === b.teamName && m.teamB === a.teamName)
        ) {
          if (m.scoreA !== null && m.scoreA !== undefined && m.scoreB !== null && m.scoreB !== undefined) {
            const isAFirst = m.teamA === a.teamName;
            const scoreA = isAFirst ? m.scoreA : m.scoreB;
            const scoreB = isAFirst ? m.scoreB : m.scoreA;
            if (scoreA > scoreB) h2hA += 1;
            else if (scoreB > scoreA) h2hB += 1;
          }
        }
      });
    });
    if (h2hB !== h2hA) return h2hB - h2hA;

    // 3. Maggior numero di vittorie
    if (b.won !== a.won) return b.won - a.won;

    // 4. Differenza punti totale
    if (b.diffPoints !== a.diffPoints) return b.diffPoints - a.diffPoints;

    // 5. Punti fatti totali
    return b.pointsFor - a.pointsFor;
  });
}

// Configurazione Tabellone Fase Finale (Quarti, Semifinali, Finale)
export interface PlayoffMatchConfig {
  id: string;
  name: string;
  andataGp: string;
  andataDate: string;
  ritornoGp?: string;
  ritornoDate?: string;
  teamA: string;
  teamB: string;
  teamALabel: string;
  teamBLabel: string;
  scoreAndataA?: number | null;
  scoreAndataB?: number | null;
  scoreRitornoA?: number | null;
  scoreRitornoB?: number | null;
  winner?: string | null;
}

export const PLAYOFF_BRACKET: {
  quarterFinals: PlayoffMatchConfig[];
  semiFinals: PlayoffMatchConfig[];
  final: PlayoffMatchConfig;
} = {
  quarterFinals: [
    {
      id: "QF1",
      name: "QUARTO 1",
      andataGp: "STATI UNITI",
      andataDate: "25/10",
      ritornoGp: "MESSICO",
      ritornoDate: "01/11",
      teamA: "Habibi motorsport F1 team",
      teamB: "Scuderia Sbinnati",
      teamALabel: "1° Girone A",
      teamBLabel: "4° Girone B",
      scoreAndataA: null,
      scoreAndataB: null,
      scoreRitornoA: null,
      scoreRitornoB: null,
      winner: null
    },
    {
      id: "QF2",
      name: "QUARTO 2",
      andataGp: "STATI UNITI",
      andataDate: "25/10",
      ritornoGp: "MESSICO",
      ritornoDate: "01/11",
      teamA: "Cavallino Arrapante",
      teamB: "Alette",
      teamALabel: "2° Girone A",
      teamBLabel: "3° Girone B",
      scoreAndataA: null,
      scoreAndataB: null,
      scoreRitornoA: null,
      scoreRitornoB: null,
      winner: null
    },
    {
      id: "QF3",
      name: "QUARTO 3",
      andataGp: "STATI UNITI",
      andataDate: "25/10",
      ritornoGp: "MESSICO",
      ritornoDate: "01/11",
      teamA: "MERDECESS AMG FORMULA 1 TEAM",
      teamB: "Speed and Power",
      teamALabel: "3° Girone A",
      teamBLabel: "2° Girone B",
      scoreAndataA: null,
      scoreAndataB: null,
      scoreRitornoA: null,
      scoreRitornoB: null,
      winner: null
    },
    {
      id: "QF4",
      name: "QUARTO 4",
      andataGp: "STATI UNITI",
      andataDate: "25/10",
      ritornoGp: "MESSICO",
      ritornoDate: "01/11",
      teamA: "AvvocatoSenior F1 team",
      teamB: "Tunzi Hyperflux Racing",
      teamALabel: "4° Girone A",
      teamBLabel: "1° Girone B",
      scoreAndataA: null,
      scoreAndataB: null,
      scoreRitornoA: null,
      scoreRitornoB: null,
      winner: null
    }
  ],
  semiFinals: [
    {
      id: "SF1",
      name: "SEMIFINALE 1",
      andataGp: "BRASILE",
      andataDate: "08/11",
      ritornoGp: "LAS VEGAS",
      ritornoDate: "22/11",
      teamA: "Vincitore QF1",
      teamB: "Vincitore QF2",
      teamALabel: "Habibi / Sbinnati",
      teamBLabel: "Cavallino / Alette",
      scoreAndataA: null,
      scoreAndataB: null,
      scoreRitornoA: null,
      scoreRitornoB: null,
      winner: null
    },
    {
      id: "SF2",
      name: "SEMIFINALE 2",
      andataGp: "BRASILE",
      andataDate: "08/11",
      ritornoGp: "LAS VEGAS",
      ritornoDate: "22/11",
      teamA: "Vincitore QF3",
      teamB: "Vincitore QF4",
      teamALabel: "Merdecess / Speed",
      teamBLabel: "Avvocato / Tunzi",
      scoreAndataA: null,
      scoreAndataB: null,
      scoreRitornoA: null,
      scoreRitornoB: null,
      winner: null
    }
  ],
  final: {
    id: "FINAL",
    name: "GRAN FINALE",
    andataGp: "ABU DHABI",
    andataDate: "06/12",
    teamA: "Vincitore SF1",
    teamB: "Vincitore SF2",
    teamALabel: "Finalista 1",
    teamBLabel: "Finalista 2",
    scoreAndataA: null,
    scoreAndataB: null,
    winner: null
  }
};

