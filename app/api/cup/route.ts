import { NextResponse } from 'next/server';
import { cupConfig } from '@/lib/cupConfig';
import { calculateMatchResult, PlayerRaceScore } from '@/lib/cupService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Qui andrebbe la logica per ottenere i punteggi della SINGOLA GARA
    // dai dati di F1 (o dal nostro KV store se stiamo salvando gli snapshot)
    const mockRaceScores: PlayerRaceScore[] = [
      { username: 'Giocatore1', score: 150 },
      { username: 'Giocatore2', score: 120 },
      { username: 'Giocatore3', score: 180 },
      { username: 'Giocatore4', score: 175 },
    ];

    const currentRaceId = 'Bahrain'; // Da determinare dinamicamente in base alla data
    
    // 2. Trova le partite correnti nel config
    const currentMatches = cupConfig.groups
      .flatMap(g => g.matchdays)
      .find(md => md.raceId === currentRaceId)?.matches || [];

    // 3. Calcola i risultati
    const results = currentMatches.map(match => {
      const p1Score = mockRaceScores.find(s => s.username === match.player1)?.score || 0;
      const p2Score = mockRaceScores.find(s => s.username === match.player2)?.score || 0;
      
      return calculateMatchResult(match.player1!, p1Score, match.player2!, p2Score);
    });

    return NextResponse.json({ success: true, currentRaceId, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
