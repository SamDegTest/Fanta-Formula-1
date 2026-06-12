import { cupConfig, PlayerId } from './cupConfig';

export interface PlayerRaceScore {
  username: PlayerId;
  score: number;
}

export interface MatchResult {
  matchId: string;
  player1: { id: PlayerId; raceScore: number; pointsEarned: number };
  player2: { id: PlayerId; raceScore: number; pointsEarned: number };
}

export interface CupStandingRow {
  username: string; // displays the teamName
  points: number;   // points earned from matches (3, 2, 1, 0)
  played: number;   // matches played
  won: number;      // matches won (where pointsEarned is 3 or 2)
  drawn: number;    // matches drawn (where pointsEarned is 1 and score difference is 0)
  lost: number;     // matches lost
  totalCupScore: number; // sum of actual race scores in matchdays
}

export function calculateMatchResult(
  p1Username: PlayerId,
  p1Score: number,
  p2Username: PlayerId,
  p2Score: number
): MatchResult {
  const diff = p1Score - p2Score;
  const absDiff = Math.abs(diff);
  const { pointsThreshold } = cupConfig;

  let p1Points = 0;
  let p2Points = 0;

  if (absDiff === 0) {
    p1Points = 1;
    p2Points = 1;
  } else if (absDiff >= pointsThreshold) {
    if (diff > 0) {
      p1Points = 3;
      p2Points = 0;
    } else {
      p1Points = 0;
      p2Points = 3;
    }
  } else {
    // absDiff < pointsThreshold and not 0
    if (diff > 0) {
      p1Points = 2;
      p2Points = 1;
    } else {
      p1Points = 1;
      p2Points = 2;
    }
  }

  return {
    matchId: `${p1Username}-vs-${p2Username}`,
    player1: { id: p1Username, raceScore: p1Score, pointsEarned: p1Points },
    player2: { id: p2Username, raceScore: p2Score, pointsEarned: p2Points },
  };
}

/**
 * Calculates and sorts the standings for a group based on the completed matches.
 * Sorting order:
 * 1. points earned from matches descending
 * 2. number of victories descending
 * 3. total score in the cup descending
 */
export function calculateGroupStandings(
  players: { id: string; teamName: string }[],
  matchdays: { raceId: string; matches: { id: string; player1: string | null; player2: string | null }[] }[],
  scoresByRace: Record<string, Record<string, number>>
): CupStandingRow[] {
  const standingsMap: Record<string, CupStandingRow> = {};

  // Initialize
  players.forEach(p => {
    standingsMap[p.id] = {
      username: p.teamName,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      totalCupScore: 0,
    };
  });

  // Calculate scores from all matchdays
  matchdays.forEach(md => {
    const raceId = md.raceId;
    const raceScores = scoresByRace[raceId] || {};

    md.matches.forEach(match => {
      if (!match.player1 || !match.player2) return;

      const p1 = match.player1;
      const p2 = match.player2;

      // Only count match if at least one player has a recorded score for that race
      const p1HasScore = p1 in raceScores;
      const p2HasScore = p2 in raceScores;
      
      if (!p1HasScore && !p2HasScore) return;

      const p1Score = raceScores[p1] || 0;
      const p2Score = raceScores[p2] || 0;

      const result = calculateMatchResult(p1, p1Score, p2, p2Score);

      const row1 = standingsMap[p1];
      const row2 = standingsMap[p2];

      if (row1 && row2) {
        row1.played += 1;
        row2.played += 1;

        row1.points += result.player1.pointsEarned;
        row2.points += result.player2.pointsEarned;

        row1.totalCupScore += p1Score;
        row2.totalCupScore += p2Score;

        if (result.player1.pointsEarned === 3 || result.player1.pointsEarned === 2) {
          row1.won += 1;
          row2.lost += 1;
        } else if (result.player2.pointsEarned === 3 || result.player2.pointsEarned === 2) {
          row2.won += 1;
          row1.lost += 1;
        } else {
          row1.drawn += 1;
          row2.drawn += 1;
        }
      }
    });
  });

  // Sort and return
  return Object.values(standingsMap).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.won !== a.won) {
      return b.won - a.won;
    }
    if (b.totalCupScore !== a.totalCupScore) {
      return b.totalCupScore - a.totalCupScore;
    }
    return a.username.localeCompare(b.username);
  });
}
