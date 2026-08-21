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
// Nota: G. Bretagna (05/07) ed Olanda (23/08) sono PAUSA COPPA
export const GIRONE_A_CALENDAR: GroupMatchday[] = [
  {
    matchday: 1,
    gpName: "SPAGNA 1",
    date: "14/06",
    restingTeam: "Habibi motorsport F1 team",
    matches: [
      { teamA: "Legione del centauro", teamB: "G. Mazzoni Gufo Racing", scoreA: 254, scoreB: 318 },
      { teamA: "AvvocatoSenior F1 team", teamB: "Cavallino Arrapante", scoreA: 209, scoreB: 227 },
      { teamA: "Beavers", teamB: "MERDECESS AMG FORMULA 1 TEAM", scoreA: 192, scoreB: 235 }
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
      { teamA: "Cavallino Arrapante", teamB: "MERDECESS AMG FORMULA 1 TEAM", scoreA: null, scoreB: null },
      { teamA: "Habibi motorsport F1 team", teamB: "Beavers", scoreA: null, scoreB: null },
      { teamA: "AvvocatoSenior F1 team", teamB: "Legione del centauro", scoreA: null, scoreB: null }
    ]
  },
  {
    matchday: 6,
    gpName: "SPAGNA 2",
    date: "13/09",
    restingTeam: "AvvocatoSenior F1 team",
    matches: [
      { teamA: "Legione del centauro", teamB: "Habibi motorsport F1 team", scoreA: null, scoreB: null },
      { teamA: "Beavers", teamB: "Cavallino Arrapante", scoreA: null, scoreB: null },
      { teamA: "MERDECESS AMG FORMULA 1 TEAM", teamB: "G. Mazzoni Gufo Racing", scoreA: null, scoreB: null }
    ]
  },
  {
    matchday: 7,
    gpName: "AZERBAIGIAN",
    date: "26/09",
    restingTeam: "MERDECESS AMG FORMULA 1 TEAM",
    matches: [
      { teamA: "G. Mazzoni Gufo Racing", teamB: "Beavers", scoreA: null, scoreB: null },
      { teamA: "Cavallino Arrapante", teamB: "Legione del centauro", scoreA: null, scoreB: null },
      { teamA: "Habibi motorsport F1 team", teamB: "AvvocatoSenior F1 team", scoreA: null, scoreB: null }
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
      { teamA: "Tunzi Hyperflux Racing", teamB: "Nenacrochet", scoreA: 175, scoreB: 153 },
      { teamA: "Alette", teamB: "Scuderia Sbinnati", scoreA: 182, scoreB: 316 },
      { teamA: "Dinoco F1 team", teamB: "Speed and Power", scoreA: 205, scoreB: 244 }
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
      { teamA: "Tunzi Hyperflux Racing", teamB: "Alette", scoreA: null, scoreB: null },
      { teamA: "Speed and Power", teamB: "Scuderia Sbinnati", scoreA: null, scoreB: null },
      { teamA: "Nenacrochet", teamB: "Dinoco F1 team", scoreA: null, scoreB: null }
    ]
  }
];

export const CUP_TIMELINE = [
  { gp: "SPAGNA 1", date: "14/06", stage: "GIRONE", round: 1, isPlayed: true, label: "GIRONE 1" },
  { gp: "AUSTRIA", date: "28/06", stage: "GIRONE", round: 2, isPlayed: true, label: "GIRONE 2" },
  { gp: "G. BRETAGNA", date: "05/07", stage: "PAUSA", round: 3, isPlayed: true, label: "PAUSA" },
  { gp: "BELGIO", date: "19/07", stage: "GIRONE", round: 4, isPlayed: true, label: "GIRONE 3" },
  { gp: "UNGHERIA", date: "26/07", stage: "GIRONE", round: 5, isPlayed: true, label: "GIRONE 4" },
  { gp: "OLANDA", date: "23/08", stage: "PAUSA", round: 6, isPlayed: false, label: "PAUSA" },
  { gp: "ITALIA", date: "06/09", stage: "GIRONE", round: 7, isPlayed: false, label: "GIRONE 5" },
  { gp: "SPAGNA 2", date: "13/09", stage: "GIRONE", round: 8, isPlayed: false, label: "GIRONE 6" },
  { gp: "AZERBAIGIAN", date: "26/09", stage: "GIRONE", round: 9, isPlayed: false, label: "GIRONE 7 (A)" },
  { gp: "SINGAPORE", date: "11/10", stage: "PAUSA", round: 10, isPlayed: false, label: "PAUSA" },
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
    if (b.cupPoints !== a.cupPoints) return b.cupPoints - a.cupPoints;
    if (b.diffPoints !== a.diffPoints) return b.diffPoints - a.diffPoints;
    return b.pointsFor - a.pointsFor;
  });
}
