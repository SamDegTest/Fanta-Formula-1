'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trophy, CalendarDays, Swords, LayoutGrid } from 'lucide-react';
import { CupStandings } from '@/components/CupStandings';
import { CupBracket } from '@/components/CupBracket';
import { CupMatches } from '@/components/CupMatches';
import { getCustomTeamInfo } from '@/lib/teams';
import { calculateGroupStandings, CupStandingRow } from '@/lib/cupService';

// Default list of 13 participants (sorted statically as fallback)
const defaultParticipantsOrder = [
  "Raul Sisto",
  "Domenico Ghionda",
  "Federico Russo",
  "Piergiorgio Tunzi",
  "Gianluca Tunzi",
  "valerio maniscalco",
  "Christian Busco",
  "Francesco Tullo",
  "Vittorio Sisto",
  "Luca Siciliani",
  "Elena Russo",
  "Davide Milella",
  "Eryk Karwasinskí"
];

// Round Robin match generator
interface Match {
  id: string;
  player1: string;
  player2: string;
}
interface Matchday {
  raceId: string;
  matches: Match[];
}

function generateGroupMatches(
  players: { id: string; teamName: string }[],
  raceIds: string[]
): Matchday[] {
  const n = players.length;
  const matchdays: Matchday[] = [];

  if (n === 0) return [];

  if (n % 2 !== 0) {
    // Odd number of teams: add a dummy "BYE" team to make the count even
    const circle = [...players, { id: 'BYE', teamName: 'BYE' }];
    const numTeams = circle.length;
    const rounds = numTeams - 1; // equal to n rounds

    for (let r = 0; r < Math.min(rounds, raceIds.length); r++) {
      const matches: Match[] = [];
      const raceId = raceIds[r];
      const roundPlayers = [...circle];

      for (let i = 0; i < numTeams / 2; i++) {
        const p1 = roundPlayers[i];
        const p2 = roundPlayers[numTeams - 1 - i];

        if (p1.id !== 'BYE' && p2.id !== 'BYE') {
          matches.push({
            id: `g-${raceId}-m-${i}`,
            player1: p1.id,
            player2: p2.id
          });
        }
      }

      matchdays.push({
        raceId,
        matches
      });

      // Rotate clockwise (keep index 0 fixed, rotate others)
      const first = circle[0];
      const rest = circle.slice(1);
      const last = rest.pop()!;
      circle.splice(0, circle.length, first, last, ...rest);
    }
  } else {
    // Even number of teams
    const circle = [...players];
    const numTeams = circle.length;
    const rounds = numTeams - 1;

    for (let r = 0; r < Math.min(rounds, raceIds.length); r++) {
      const matches: Match[] = [];
      const raceId = raceIds[r];
      const roundPlayers = [...circle];

      for (let i = 0; i < numTeams / 2; i++) {
        const p1 = roundPlayers[i];
        const p2 = roundPlayers[numTeams - 1 - i];
        matches.push({
          id: `g-${raceId}-m-${i}`,
          player1: p1.id,
          player2: p2.id
        });
      }

      matchdays.push({
        raceId,
        matches
      });

      // Rotate
      const first = circle[0];
      const rest = circle.slice(1);
      const last = rest.pop()!;
      circle.splice(0, circle.length, first, last, ...rest);
    }
  }

  // Handle any additional matchdays (e.g. if we have more raceIds than rounds)
  for (let r = matchdays.length; r < raceIds.length; r++) {
    matchdays.push({
      raceId: raceIds[r],
      matches: []
    });
  }

  return matchdays;
}


export default function CoppaPage() {
  const [activeView, setActiveView] = useState<'gironi' | 'fase-finale'>('gironi');
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0);

  // 1. Get ordering from local general standings
  const getOrderedParticipants = (): string[] => {
    if (typeof window === 'undefined') return defaultParticipantsOrder;
    try {
      const cached = localStorage.getItem('f1_fantasy_standings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.aggregated && parsed.aggregated.length > 0) {
          const rankMap: Record<string, number> = {};
          parsed.aggregated.forEach((item: any, index: number) => {
            rankMap[item.username.toLowerCase()] = index;
          });
          return [...defaultParticipantsOrder].sort((a, b) => {
            const rankA = rankMap[a.toLowerCase()] !== undefined ? rankMap[a.toLowerCase()] : 999;
            const rankB = rankMap[b.toLowerCase()] !== undefined ? rankMap[b.toLowerCase()] : 999;
            return rankA - rankB;
          });
        }
      }
    } catch (e) {
      console.error("Errore nel recupero della classifica generale per i gironi:", e);
    }
    return defaultParticipantsOrder;
  };

  const getTeamName = (playerId: string | null) => {
    if (!playerId) return 'TBD';
    const info = getCustomTeamInfo(playerId, '');
    return info ? info.name : playerId;
  };

  // 2. Dynamic group division (Group A alternates even indices, Group B alternates odd)
  const orderedParticipants = getOrderedParticipants();
  const groupAPlayers = orderedParticipants.filter((_, idx) => idx % 2 === 0).map(id => ({
    id,
    teamName: getTeamName(id)
  }));
  const groupBPlayers = orderedParticipants.filter((_, idx) => idx % 2 !== 0).map(id => ({
    id,
    teamName: getTeamName(id)
  }));

  // 3. Dynamic match scheduling
  const raceIds = ['Spagna1', 'Austria', 'Belgio', 'Ungheria', 'Italia', 'Spagna2'];
  const groupAMatchdays = generateGroupMatches(groupAPlayers, raceIds);
  const groupBMatchdays = generateGroupMatches(groupBPlayers, raceIds).filter(md => md.matches.length > 0);

  // Group config structure
  const groups = [
    { id: 'group-a', name: 'Girone A', players: groupAPlayers, matchdays: groupAMatchdays },
    { id: 'group-b', name: 'Girone B', players: groupBPlayers, matchdays: groupBMatchdays }
  ];

  const getSnapshots = () => {
    if (typeof window === 'undefined') return {};
    try {
      const cachedSnaps = localStorage.getItem('cup_cumulative_snapshots');
      return cachedSnaps ? JSON.parse(cachedSnaps) : {};
    } catch (e) {
      console.error(e);
      return {};
    }
  };

  const snapshots = getSnapshots();

  // Compute actual scores per player per race
  const getRaceScores = () => {
    const raceScores: Record<string, Record<string, number>> = {};

    // Ordered races map
    const rounds = [
      { round: 6, id: 'Monaco' },
      { round: 7, id: 'Spagna1' },
      { round: 8, id: 'Austria' },
      { round: 9, id: 'Britain' },
      { round: 10, id: 'Belgio' },
      { round: 11, id: 'Ungheria' },
      { round: 12, id: 'Olanda' },
      { round: 13, id: 'Italia' },
      { round: 14, id: 'Spagna2' },
      { round: 15, id: 'Azerbaigian' },
      { round: 16, id: 'Singapore' },
      { round: 17, id: 'StatiUniti' },
      { round: 18, id: 'Messico' },
      { round: 19, id: 'Brasile' },
      { round: 20, id: 'LasVegas' },
      { round: 21, id: 'Qatar' },
      { round: 22, id: 'AbuDhabi' }
    ];

    // Prepopulate Monaco baseline (Round 6)
    const allSnapshots = { ...snapshots };
    if (!allSnapshots['Monaco']) {
      allSnapshots['Monaco'] = {
        "valerio maniscalco": 2620,
        "Francesco Tullo": 2618,
        "Gianluca Tunzi": 2964,
        "Elena Russo": 2293,
        "Federico Russo": 2810,
        "Domenico Ghionda": 3363,
        "Christian Busco": 2661,
        "Raul Sisto": 2889,
        "Davide Milella": 2391,
        "Eryk Karwasinskí": 2128,
        "Piergiorgio Tunzi": 2848,
        "Luca Siciliani": 2489,
        "Vittorio Sisto": 2633
      };
    }

    // Compute differences
    for (let i = 1; i < rounds.length; i++) {
      const prev = rounds[i - 1];
      const curr = rounds[i];
      const prevSnap = allSnapshots[prev.id];
      const currSnap = allSnapshots[curr.id];

      if (prevSnap && currSnap) {
        raceScores[curr.id] = {};
        Object.keys(currSnap).forEach(player => {
          const score = currSnap[player] - (prevSnap[player] || 0);
          raceScores[curr.id][player] = Math.max(0, score);
        });
      }
    }

    return raceScores;
  };

  const computedRaceScores = getRaceScores();

  // Standings per group
  const groupAStandings = calculateGroupStandings(groupAPlayers, groupAMatchdays, computedRaceScores);
  const groupBStandings = calculateGroupStandings(groupBPlayers, groupBMatchdays, computedRaceScores);

  const groupStandings = [groupAStandings, groupBStandings];

  // Dynamic Bracket Calculations
  const getBracketData = () => {
    const isGroupStageFinished = !!snapshots['Spagna2'];

    const getTopTeam = (standings: CupStandingRow[], idx: number, groupLetter: string) => {
      if (standings.length > idx) {
        const teamName = standings[idx].username;
        const player = orderedParticipants.find(id => getTeamName(id) === teamName);
        return { id: player || teamName, teamName };
      }
      return { id: null, teamName: `${idx + 1}° ${groupLetter}` };
    };

    const t1A = isGroupStageFinished ? getTopTeam(groupAStandings, 0, 'Girone A') : { id: null, teamName: '1° Girone A' };
    const t2A = isGroupStageFinished ? getTopTeam(groupAStandings, 1, 'Girone A') : { id: null, teamName: '2° Girone A' };
    const t3A = isGroupStageFinished ? getTopTeam(groupAStandings, 2, 'Girone A') : { id: null, teamName: '3° Girone A' };
    const t4A = isGroupStageFinished ? getTopTeam(groupAStandings, 3, 'Girone A') : { id: null, teamName: '4° Girone A' };

    const t1B = isGroupStageFinished ? getTopTeam(groupBStandings, 0, 'Girone B') : { id: null, teamName: '1° Girone B' };
    const t2B = isGroupStageFinished ? getTopTeam(groupBStandings, 1, 'Girone B') : { id: null, teamName: '2° Girone B' };
    const t3B = isGroupStageFinished ? getTopTeam(groupBStandings, 2, 'Girone B') : { id: null, teamName: '3° Girone B' };
    const t4B = isGroupStageFinished ? getTopTeam(groupBStandings, 3, 'Girone B') : { id: null, teamName: '4° Girone B' };

    // Quarti Leg 1: Azerbaigian, Leg 2: StatiUniti
    const qfPairings = [
      { id: 'qf-1', p1: t1A, p2: t4B },
      { id: 'qf-2', p1: t2A, p2: t3B },
      { id: 'qf-3', p1: t3A, p2: t2B },
      { id: 'qf-4', p1: t4A, p2: t1B }
    ];

    const qfResults = qfPairings.map(pair => {
      const p1 = pair.p1;
      const p2 = pair.p2;

      const scoresAndata = computedRaceScores['Azerbaigian'] || {};
      const scoresRitorno = computedRaceScores['StatiUniti'] || {};

      const p1Andata = p1.id && p1.id in scoresAndata ? scoresAndata[p1.id] : null;
      const p2Andata = p2.id && p2.id in scoresAndata ? scoresAndata[p2.id] : null;

      const p1Ritorno = p1.id && p1.id in scoresRitorno ? scoresRitorno[p1.id] : null;
      const p2Ritorno = p2.id && p2.id in scoresRitorno ? scoresRitorno[p2.id] : null;

      const hasAndata = p1Andata !== null || p2Andata !== null;
      const hasRitorno = p1Ritorno !== null || p2Ritorno !== null;

      const p1Total = (hasAndata ? (p1Andata || 0) : 0) + (hasRitorno ? (p1Ritorno || 0) : 0);
      const p2Total = (hasAndata ? (p2Andata || 0) : 0) + (hasRitorno ? (p2Ritorno || 0) : 0);

      let winnerId: string | null = null;
      if (p1.id && p2.id && (hasAndata || hasRitorno)) {
        if (p1Total > p2Total) {
          winnerId = p1.id;
        } else if (p2Total > p1Total) {
          winnerId = p2.id;
        } else {
          winnerId = p1.id;
        }
      }

      return {
        matchId: pair.id,
        player1: { id: p1.id, teamName: p1.teamName, andata: p1Andata, ritorno: p1Ritorno, total: (hasAndata || hasRitorno) ? p1Total : null },
        player2: { id: p2.id, teamName: p2.teamName, andata: p2Andata, ritorno: p2Ritorno, total: (hasAndata || hasRitorno) ? p2Total : null },
        winnerId
      };
    });

    // Semifinali Leg 1: Brasile, Leg 2: LasVegas
    const getWinnerOfQF = (qfId: string, label: string) => {
      const qf = qfResults.find(q => q.matchId === qfId);
      if (qf && qf.winnerId) {
        const isP1 = qf.winnerId === qf.player1.id;
        return { id: qf.winnerId, teamName: isP1 ? qf.player1.teamName : qf.player2.teamName };
      }
      return { id: null, teamName: label };
    };

    const sfPairings = [
      { id: 'sf-1', p1: getWinnerOfQF('qf-1', 'Vincitore QF1'), p2: getWinnerOfQF('qf-3', 'Vincitore QF3') },
      { id: 'sf-2', p1: getWinnerOfQF('qf-2', 'Vincitore QF2'), p2: getWinnerOfQF('qf-4', 'Vincitore QF4') }
    ];

    const sfResults = sfPairings.map(pair => {
      const p1 = pair.p1;
      const p2 = pair.p2;

      const scoresAndata = computedRaceScores['Brasile'] || {};
      const scoresRitorno = computedRaceScores['LasVegas'] || {};

      const p1Andata = p1.id && p1.id in scoresAndata ? scoresAndata[p1.id] : null;
      const p2Andata = p2.id && p2.id in scoresAndata ? scoresAndata[p2.id] : null;

      const p1Ritorno = p1.id && p1.id in scoresRitorno ? scoresRitorno[p1.id] : null;
      const p2Ritorno = p2.id && p2.id in scoresRitorno ? scoresRitorno[p2.id] : null;

      const hasAndata = p1Andata !== null || p2Andata !== null;
      const hasRitorno = p1Ritorno !== null || p2Ritorno !== null;

      const p1Total = (hasAndata ? (p1Andata || 0) : 0) + (hasRitorno ? (p1Ritorno || 0) : 0);
      const p2Total = (hasAndata ? (p2Andata || 0) : 0) + (hasRitorno ? (p2Ritorno || 0) : 0);

      let winnerId: string | null = null;
      if (p1.id && p2.id && (hasAndata || hasRitorno)) {
        if (p1Total > p2Total) {
          winnerId = p1.id;
        } else if (p2Total > p1Total) {
          winnerId = p2.id;
        } else {
          winnerId = p1.id;
        }
      }

      return {
        matchId: pair.id,
        player1: { id: p1.id, teamName: p1.teamName, andata: p1Andata, ritorno: p1Ritorno, total: (hasAndata || hasRitorno) ? p1Total : null },
        player2: { id: p2.id, teamName: p2.teamName, andata: p2Andata, ritorno: p2Ritorno, total: (hasAndata || hasRitorno) ? p2Total : null },
        winnerId
      };
    });

    // Finale Single Leg: AbuDhabi
    const getWinnerOfSF = (sfId: string, label: string) => {
      const sf = sfResults.find(s => s.matchId === sfId);
      if (sf && sf.winnerId) {
        const isP1 = sf.winnerId === sf.player1.id;
        return { id: sf.winnerId, teamName: isP1 ? sf.player1.teamName : sf.player2.teamName };
      }
      return { id: null, teamName: label };
    };

    const finalPairing = { id: 'f-1', p1: getWinnerOfSF('sf-1', 'Vincitore SF1'), p2: getWinnerOfSF('sf-2', 'Vincitore SF2') };
    const finalScores = computedRaceScores['AbuDhabi'] || {};

    const p1Final = finalPairing.p1.id && finalPairing.p1.id in finalScores ? finalScores[finalPairing.p1.id] : null;
    const p2Final = finalPairing.p2.id && finalPairing.p2.id in finalScores ? finalScores[finalPairing.p2.id] : null;

    const hasFinal = p1Final !== null || p2Final !== null;

    let finalWinnerId: string | null = null;
    if (finalPairing.p1.id && finalPairing.p2.id && hasFinal) {
      if ((p1Final || 0) > (p2Final || 0)) {
        finalWinnerId = finalPairing.p1.id;
      } else if ((p2Final || 0) > (p1Final || 0)) {
        finalWinnerId = finalPairing.p2.id;
      } else {
        finalWinnerId = finalPairing.p1.id;
      }
    }

    const finalResult = {
      matchId: finalPairing.id,
      player1: { id: finalPairing.p1.id, teamName: finalPairing.p1.teamName, andata: p1Final, ritorno: null, total: p1Final },
      player2: { id: finalPairing.p2.id, teamName: finalPairing.p2.teamName, andata: p2Final, ritorno: null, total: p2Final },
      winnerId: finalWinnerId
    };

    return { qfResults, sfResults, finalResult };
  };

  const { qfResults, sfResults, finalResult } = getBracketData();

  // 5. Automatic snapshot generation on page load
  const handleCupSync = (generalStandings: any[]) => {
    const raceDates = [
      { id: 'Monaco', date: '2026-06-07' },
      { id: 'Spagna1', date: '2026-06-14' },
      { id: 'Austria', date: '2026-06-28' },
      { id: 'Britain', date: '2026-07-05' },
      { id: 'Belgio', date: '2026-07-19' },
      { id: 'Ungheria', date: '2026-07-26' },
      { id: 'Olanda', date: '2026-08-23' },
      { id: 'Italia', date: '2026-09-06' },
      { id: 'Spagna2', date: '2026-09-13' },
      { id: 'Azerbaigian', date: '2026-09-26' },
      { id: 'Singapore', date: '2026-10-11' },
      { id: 'StatiUniti', date: '2026-10-25' },
      { id: 'Messico', date: '2026-11-01' },
      { id: 'Brasile', date: '2026-11-08' },
      { id: 'LasVegas', date: '2026-11-22' },
      { id: 'Qatar', date: '2026-11-29' },
      { id: 'AbuDhabi', date: '2026-12-06' }
    ];

    const nowStr = new Date().toISOString().split('T')[0];
    let latestCompletedRaceId = 'Monaco'; // baseline fallback

    for (const r of raceDates) {
      if (nowStr >= r.date) {
        latestCompletedRaceId = r.id;
      }
    }

    try {
      const cachedSnapshots = localStorage.getItem('cup_cumulative_snapshots');
      const snaps = cachedSnapshots ? JSON.parse(cachedSnapshots) : {};

      const currentScores: Record<string, number> = {};
      generalStandings.forEach((item: any) => {
        const username = item.username;
        currentScores[username] = item.totalScore;
      });

      snaps[latestCompletedRaceId] = currentScores;
      localStorage.setItem('cup_cumulative_snapshots', JSON.stringify(snaps));
    } catch (e) {
      console.error("Errore snapshot coppa:", e);
    }
  };

  useEffect(() => {
    // Self-healing check to automatically clear mock data from client side
    try {
      const cached = localStorage.getItem('cup_cumulative_snapshots');
      if (cached) {
        const snaps = JSON.parse(cached);
        const raceDates = [
          { id: 'Spagna1', date: '2026-06-14' },
          { id: 'Austria', date: '2026-06-28' },
          { id: 'Britain', date: '2026-07-05' },
          { id: 'Belgio', date: '2026-07-19' },
          { id: 'Ungheria', date: '2026-07-26' },
          { id: 'Olanda', date: '2026-08-23' },
          { id: 'Italia', date: '2026-09-06' },
          { id: 'Spagna2', date: '2026-09-13' },
          { id: 'Azerbaigian', date: '2026-09-26' },
          { id: 'Singapore', date: '2026-10-11' },
          { id: 'StatiUniti', date: '2026-10-25' },
          { id: 'Messico', date: '2026-11-01' },
          { id: 'Brasile', date: '2026-11-08' },
          { id: 'LasVegas', date: '2026-11-22' },
          { id: 'Qatar', date: '2026-11-29' },
          { id: 'AbuDhabi', date: '2026-12-06' }
        ];
        const nowStr = new Date().toISOString().split('T')[0];

        // If there's any snap for a GP that hasn't happened yet, it's mock data -> clear it
        const hasMockData = Object.keys(snaps).some(gpId => {
          const race = raceDates.find(r => r.id === gpId);
          return race && nowStr < race.date;
        });

        if (hasMockData) {
          localStorage.removeItem('cup_cumulative_snapshots');
        }
      }
    } catch (e) {
      console.error("Errore auto-pulizia dati mock:", e);
    }

    try {
      const standingsStr = localStorage.getItem('f1_fantasy_standings');
      if (standingsStr) {
        const parsed = JSON.parse(standingsStr);
        if (parsed.aggregated && parsed.aggregated.length > 0) {
          handleCupSync(parsed.aggregated);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);



  const getSimulationStatus = () => {
    const rounds = [
      'Monaco', 'Spagna1', 'Austria', 'Britain', 'Belgio', 'Ungheria',
      'Olanda', 'Italia', 'Spagna2', 'Azerbaigian', 'Singapore',
      'StatiUniti', 'Messico', 'Brasile', 'LasVegas', 'Qatar', 'AbuDhabi'
    ];

    const snaps = snapshots || {};
    const simulatedGPs: string[] = [];
    let nextGP = '';

    for (let i = 1; i < rounds.length; i++) {
      if (snaps[rounds[i]]) {
        simulatedGPs.push(rounds[i]);
      } else {
        if (!nextGP) {
          nextGP = rounds[i];
        }
      }
    }

    return {
      simulatedGPs,
      nextGP,
      isFullySimulated: simulatedGPs.length === rounds.length - 1,
      hasStartedSim: simulatedGPs.length > 0
    };
  };

  const simStatus = getSimulationStatus();

  const getTimelineProgress = () => {
    const raceDates = [
      { id: 'Spagna1', date: '2026-06-14' },
      { id: 'Austria', date: '2026-06-28' },
      { id: 'Britain', date: '2026-07-05' },
      { id: 'Belgio', date: '2026-07-19' },
      { id: 'Ungheria', date: '2026-07-26' },
      { id: 'Olanda', date: '2026-08-23' },
      { id: 'Italia', date: '2026-09-06' },
      { id: 'Spagna2', date: '2026-09-13' },
      { id: 'Azerbaigian', date: '2026-09-26' },
      { id: 'Singapore', date: '2026-10-11' },
      { id: 'StatiUniti', date: '2026-10-25' },
      { id: 'Messico', date: '2026-11-01' },
      { id: 'Brasile', date: '2026-11-08' },
      { id: 'LasVegas', date: '2026-11-22' },
      { id: 'Qatar', date: '2026-11-29' },
      { id: 'AbuDhabi', date: '2026-12-06' }
    ];

    const nowStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date(nowStr).getTime();

    // 1. If today is before the first race Spagna 1, progress is 0.
    const firstRaceTime = new Date(raceDates[0].date).getTime();
    if (nowTime <= firstRaceTime) {
      return 0;
    }

    // 2. If today is after the last race Abu Dhabi, progress is 15 (completed)
    const lastRaceTime = new Date(raceDates[raceDates.length - 1].date).getTime();
    if (nowTime >= lastRaceTime) {
      return 15;
    }

    // 3. Find the segment between which today lies
    for (let i = 0; i < raceDates.length - 1; i++) {
      const startRace = raceDates[i];
      const endRace = raceDates[i + 1];
      const startTime = new Date(startRace.date).getTime();
      const endTime = new Date(endRace.date).getTime();

      if (nowTime >= startTime && nowTime < endTime) {
        // Linear interpolation between index i and index i + 1
        const elapsed = nowTime - startTime;
        const total = endTime - startTime;
        const fraction = elapsed / total;
        return i + fraction;
      }
    }

    return 0;
  };

  const progressIndex = getTimelineProgress();
  const progressPercent = (progressIndex / 15) * 100;

  const gpDates: Record<string, string> = {
    Spagna1: "14/06",
    Austria: "28/06",
    Britain: "05/07",
    Belgio: "19/07",
    Ungheria: "26/07",
    Olanda: "23/08",
    Italia: "06/09",
    Spagna2: "13/09",
    Azerbaigian: "26/09",
    Singapore: "11/10",
    StatiUniti: "25/10",
    Messico: "01/11",
    Brasile: "08/11",
    LasVegas: "22/11",
    Qatar: "29/11",
    AbuDhabi: "06/12"
  };

  const gpNames: Record<string, string> = {
    Spagna1: "Spagna 1",
    Austria: "Austria",
    Britain: "G. Bretagna",
    Belgio: "Belgio",
    Ungheria: "Ungheria",
    Olanda: "Olanda",
    Italia: "Italia",
    Spagna2: "Spagna 2",
    Azerbaigian: "Azerbaigian",
    Singapore: "Singapore",
    StatiUniti: "Stati Uniti",
    Messico: "Messico",
    Brasile: "Brasile",
    LasVegas: "Las Vegas",
    Qatar: "Qatar",
    AbuDhabi: "Abu Dhabi"
  };

  const gpCountryCodes: Record<string, string> = {
    Spagna1: "es",
    Austria: "at",
    Britain: "gb",
    Belgio: "be",
    Ungheria: "hu",
    Olanda: "nl",
    Italia: "it",
    Spagna2: "es",
    Azerbaigian: "az",
    Singapore: "sg",
    StatiUniti: "us",
    Messico: "mx",
    Brasile: "br",
    LasVegas: "us",
    Qatar: "qa",
    AbuDhabi: "ae"
  };

  const activeGroup = groups[activeGroupIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
      {/* Intestazione Coppa con Immagine */}
      <div className="mb-8 flex flex-col items-center justify-center gap-6">
        <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 flex items-center justify-center bg-[#1C2541] rounded-full border-4 border-[#F5A623]/80 overflow-hidden shadow-[0_0_35px_rgba(245,166,35,0.4)] transition-transform hover:scale-105 duration-300">
          <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-[#F5A623] absolute z-0" />
          <Image
            src={`/api/drive-images?type=league&name=cricchetto_cup`}
            alt="Piston Cup Logo"
            fill
            sizes="(max-width: 640px) 96px, 128px"
            className="object-cover relative z-10"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-widest uppercase drop-shadow-md text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] to-[#D35400]">Piston Cup</span>
        </h1>
      </div>

      {/* Timeline del Campionato */}
      <div className="mb-10 max-w-7xl mx-auto bg-[#1C2541]/20 border border-[#F5A623]/20 p-5 rounded-none shadow-lg">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse"></span>
              Timeline Gare Piston Cup
            </span>
            {simStatus.hasStartedSim ? (
              <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono text-[10px] tracking-wide">
                Gare Disputate: {simStatus.simulatedGPs.length} / 16 GP
              </span>
            ) : (
              <span className="text-slate-500 bg-slate-900/50 px-2.5 py-0.5 rounded-full border border-slate-800/80 font-mono text-[10px]">
                Stato Reale (Pre-Coppa)
              </span>
            )}
          </div>

          {/* Timeline scroll container */}
          <div className="overflow-x-auto pb-4 pt-10 -mx-2 px-2 custom-scrollbar">
            <div className="relative flex justify-between min-w-[1200px] w-full py-1">
              {/* Background Line */}
              <div className="absolute top-[17px] left-[35px] right-[35px] h-[3px] bg-slate-800 rounded z-0"></div>

              {/* Active Progress Line */}
              <div
                className="absolute top-[17px] left-[35px] h-[3px] bg-gradient-to-r from-emerald-500 via-emerald-400 to-[#F5A623] rounded z-0 transition-all duration-700 ease-out"
                style={{ width: `calc((${progressPercent} / 100) * (100% - 70px))` }}
              ></div>


              {/* Simulated GP Nodes */}
              {['Spagna1', 'Austria', 'Britain', 'Belgio', 'Ungheria', 'Olanda', 'Italia', 'Spagna2', 'Azerbaigian', 'Singapore', 'StatiUniti', 'Messico', 'Brasile', 'LasVegas', 'Qatar', 'AbuDhabi'].map((gpId) => {
                const isSimulated = simStatus.simulatedGPs.includes(gpId);
                const isNext = simStatus.nextGP === gpId;
                const name = gpNames[gpId] || gpId;

                // Determine tournament phase tag
                let phaseLabel = 'Pausa';
                if (['Spagna1', 'Austria', 'Belgio', 'Ungheria', 'Italia', 'Spagna2'].includes(gpId)) {
                  phaseLabel = 'Girone';
                } else if (['Azerbaigian', 'StatiUniti'].includes(gpId)) {
                  phaseLabel = 'Quarti';
                } else if (['Brasile', 'LasVegas'].includes(gpId)) {
                  phaseLabel = 'Semifinale';
                } else if (gpId === 'AbuDhabi') {
                  phaseLabel = 'Finale';
                }

                return (
                  <div key={gpId} className="relative flex flex-col items-center w-[70px] z-10 cursor-default group">
                    {/* Interactive hover card (tooltip style) */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 bg-[#0B132B] border border-slate-700/80 px-2 py-1 rounded text-[9px] font-semibold text-slate-300 w-max z-50 shadow-xl">
                      {isSimulated ? 'Disputato / Calcolato' : isNext ? 'GP in corso' : 'Non ancora disputato'}
                    </div>

                    {/* Node Dot / Flag */}
                    <div className={`relative flex h-[32px] w-[32px] items-center justify-center rounded-full border-2 overflow-hidden transition-all duration-500 bg-slate-900 ${isSimulated
                      ? 'border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                      : isNext
                        ? 'border-[#F5A623] shadow-[0_0_15px_rgba(245,166,35,0.45)] animate-pulse'
                        : 'border-slate-800'
                      }`}>
                      <img
                        src={`https://flagcdn.com/w40/${gpCountryCodes[gpId]}.png`}
                        alt={name}
                        className={`w-full h-full object-cover transition-all duration-300 ${isSimulated ? 'brightness-100 saturate-100' :
                          isNext ? 'brightness-110 saturate-100' :
                            'grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-80'
                          }`}
                      />
                      {isSimulated && (
                        <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center pointer-events-none">
                          <div className="bg-emerald-500 text-white rounded-full p-0.5 shadow-sm text-[8px] font-black leading-none scale-90 translate-y-2.5 translate-x-2.5 absolute bottom-0 right-0">✓</div>
                        </div>
                      )}
                    </div>

                    {/* Labels */}
                    <span className={`text-[10px] font-black text-center mt-2.5 tracking-wide uppercase truncate max-w-[65px] transition-colors duration-300 ${isSimulated ? 'text-emerald-400' : isNext ? 'text-[#F5A623] font-black' : 'text-slate-500'
                      }`}>
                      {name}
                    </span>

                    <span className={`text-[8px] font-black tracking-wider uppercase mt-1 px-1.5 py-0.5 rounded-sm transition-colors duration-300 ${isNext ? 'bg-[#F5A623]/10 text-[#F5A623]/80 border border-[#F5A623]/20' :
                      isSimulated ? 'bg-emerald-500/5 text-emerald-400/80 border border-emerald-500/10' :
                        'text-slate-600 bg-slate-950/50 border border-slate-900/20'
                      }`}>
                      {phaseLabel}
                    </span>

                    <span className="text-[9px] font-mono text-slate-500 mt-1 font-bold">
                      {gpDates[gpId] || ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sotto-Menu */}

      <div className="flex justify-center mb-10">
        <div className="bg-[#1C2541] p-1 rounded-full flex gap-1 border border-[#F5A623]/30 shadow-lg">
          <button
            onClick={() => setActiveView('gironi')}
            className={`px-6 py-2.5 rounded-full text-sm sm:text-base font-bold transition-all flex items-center gap-2 ${activeView === 'gironi'
              ? 'bg-[#F5A623] text-[#0B132B] shadow-[0_0_15px_rgba(245,166,35,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="hidden sm:inline">Fase a</span> Gironi
          </button>
          <button
            onClick={() => setActiveView('fase-finale')}
            className={`px-6 py-2.5 rounded-full text-sm sm:text-base font-bold transition-all flex items-center gap-2 ${activeView === 'fase-finale'
              ? 'bg-[#F5A623] text-[#0B132B] shadow-[0_0_15px_rgba(245,166,35,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
          >
            <Trophy className="w-5 h-5" />
            Fase Finale
          </button>
        </div>
      </div>

      {/* VISTA: FASE A GIRONI */}
      {activeView === 'gironi' && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">

          {/* Selettore Girone */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {groups.map((group, index) => (
              <button
                key={group.id}
                onClick={() => setActiveGroupIndex(index)}
                className={`px-5 py-2 border-b-2 font-black tracking-wider uppercase transition-colors ${activeGroupIndex === index
                  ? 'border-[#F5A623] text-[#F5A623]'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
                  }`}
              >
                {group.name}
              </button>
            ))}
          </div>

          {/* Contenuto Girone Attivo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Colonna Sinistra: Classifica */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="flex items-center gap-3 mb-4 pl-1">
                <Trophy className="w-5 h-5 text-[#F5A623]" />
                <h2 className="text-xl font-bold text-white tracking-wide">Classifica {activeGroup.name}</h2>
              </div>
              <CupStandings
                groupId={activeGroup.name}
                standings={groupStandings[activeGroupIndex] as any}
              />
            </div>

            {/* Colonna Destra: Calendario Match */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-4 pl-1">
                <CalendarDays className="w-5 h-5 text-[#F5A623]" />
                <h2 className="text-xl font-bold text-white tracking-wide">Calendario & Risultati</h2>
              </div>

              <div className="bg-[#050A1F]/50 p-1 rounded-xl border border-slate-800/50">
                <CupMatches
                  matchdays={activeGroup.matchdays}
                  getTeamName={getTeamName}
                  scoresByRace={computedRaceScores}
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VISTA: FASE FINALE */}
      {activeView === 'fase-finale' && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-8">
            <Swords className="w-6 h-6 text-[#F5A623]" />
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">Tabellone a Eliminazione</h2>
          </div>

          <div className="w-full bg-[#050A1F]/80 rounded-xl p-4 md:p-8 shadow-2xl border border-[#F5A623]/20 overflow-x-auto custom-scrollbar">
            <div className="min-w-max mx-auto">
              <CupBracket
                quarterFinals={qfResults as any}
                semiFinals={sfResults as any}
                final={finalResult as any}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
