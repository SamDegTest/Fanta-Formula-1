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
    // absDiff < pointsThreshold e diverso da 0
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
