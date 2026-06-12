export type PlayerId = string;

export interface CupPlayer {
  id: PlayerId;
  teamName: string;
}

export interface Match {
  id: string;
  player1: PlayerId | null;
  player2: PlayerId | null;
}

export interface Matchday {
  raceId: string;
  matches: Match[];
}

export interface Group {
  id: string;
  name: string;
  players: CupPlayer[];
  matchdays: Matchday[];
}

export interface CupConfig {
  pointsThreshold: number;
  groups: Group[];
  bracket: {
    quarterFinals: Matchday;
    semiFinals: Matchday;
    final: Matchday;
  };
}

// Lista estratta a sorte
export const cupConfig: CupConfig = {
  pointsThreshold: 40,
  groups: [
    {
      id: 'group-a',
      name: 'Girone A',
      players: [
        { id: 'valerio maniscalco', teamName: 'Speed and Power' },
        { id: 'Francesco Tullo', teamName: 'MERDECESS AMG FORMULA 1 TEAM' },
        { id: 'Gianluca Tunzi', teamName: 'Tunzi Hyperflux Racing' },
        { id: 'Elena Russo', teamName: 'Nenacrochet' }
      ],
      matchdays: [
        { raceId: 'Gara1', matches: [{ id: 'gA-m1', player1: 'valerio maniscalco', player2: 'Francesco Tullo' }, { id: 'gA-m2', player1: 'Gianluca Tunzi', player2: 'Elena Russo' }] },
        { raceId: 'Gara2', matches: [{ id: 'gA-m3', player1: 'valerio maniscalco', player2: 'Gianluca Tunzi' }, { id: 'gA-m4', player1: 'Francesco Tullo', player2: 'Elena Russo' }] },
        { raceId: 'Gara3', matches: [{ id: 'gA-m5', player1: 'valerio maniscalco', player2: 'Elena Russo' }, { id: 'gA-m6', player1: 'Francesco Tullo', player2: 'Gianluca Tunzi' }] },
        { raceId: 'Gara4', matches: [{ id: 'gA-m7', player1: 'Francesco Tullo', player2: 'valerio maniscalco' }, { id: 'gA-m8', player1: 'Elena Russo', player2: 'Gianluca Tunzi' }] },
        { raceId: 'Gara5', matches: [{ id: 'gA-m9', player1: 'Gianluca Tunzi', player2: 'valerio maniscalco' }, { id: 'gA-m10', player1: 'Elena Russo', player2: 'Francesco Tullo' }] },
        { raceId: 'Gara6', matches: [{ id: 'gA-m11', player1: 'Elena Russo', player2: 'valerio maniscalco' }, { id: 'gA-m12', player1: 'Gianluca Tunzi', player2: 'Francesco Tullo' }] },
      ],
    },
    {
      id: 'group-b',
      name: 'Girone B',
      players: [
        { id: 'Federico Russo', teamName: 'AvvocatoSenior F1 team' },
        { id: 'Domenico Ghionda', teamName: 'Habibi motorsport F1 team' },
        { id: 'Christian Busco', teamName: 'Dinoco F1 team' }
      ],
      matchdays: [
        { raceId: 'Gara1', matches: [{ id: 'gB-m1', player1: 'Federico Russo', player2: 'Domenico Ghionda' }] },
        { raceId: 'Gara2', matches: [{ id: 'gB-m2', player1: 'Domenico Ghionda', player2: 'Christian Busco' }] },
        { raceId: 'Gara3', matches: [{ id: 'gB-m3', player1: 'Christian Busco', player2: 'Federico Russo' }] },
        { raceId: 'Gara4', matches: [{ id: 'gB-m4', player1: 'Domenico Ghionda', player2: 'Federico Russo' }] },
        { raceId: 'Gara5', matches: [{ id: 'gB-m5', player1: 'Christian Busco', player2: 'Domenico Ghionda' }] },
        { raceId: 'Gara6', matches: [{ id: 'gB-m6', player1: 'Federico Russo', player2: 'Christian Busco' }] },
      ],
    },
    {
      id: 'group-c',
      name: 'Girone C',
      players: [
        { id: 'Raul Sisto', teamName: 'Legione del centauro' },
        { id: 'Davide Milella', teamName: 'Cavallino Arrapante' },
        { id: 'Eryk Karwasinskí', teamName: 'G. Mazzoni Gufo Racing' }
      ],
      matchdays: [
        { raceId: 'Gara1', matches: [{ id: 'gC-m1', player1: 'Raul Sisto', player2: 'Davide Milella' }] },
        { raceId: 'Gara2', matches: [{ id: 'gC-m2', player1: 'Davide Milella', player2: 'Eryk Karwasinskí' }] },
        { raceId: 'Gara3', matches: [{ id: 'gC-m3', player1: 'Eryk Karwasinskí', player2: 'Raul Sisto' }] },
        { raceId: 'Gara4', matches: [{ id: 'gC-m4', player1: 'Davide Milella', player2: 'Raul Sisto' }] },
        { raceId: 'Gara5', matches: [{ id: 'gC-m5', player1: 'Eryk Karwasinskí', player2: 'Davide Milella' }] },
        { raceId: 'Gara6', matches: [{ id: 'gC-m6', player1: 'Raul Sisto', player2: 'Eryk Karwasinskí' }] },
      ],
    },
    {
      id: 'group-d',
      name: 'Girone D',
      players: [
        { id: 'Piergiorgio Tunzi', teamName: 'Alette' },
        { id: 'Luca Siciliani', teamName: 'Scuderia Sbinnati' },
        { id: 'Vittorio Sisto', teamName: 'Beavers' }
      ],
      matchdays: [
        { raceId: 'Gara1', matches: [{ id: 'gD-m1', player1: 'Piergiorgio Tunzi', player2: 'Luca Siciliani' }] },
        { raceId: 'Gara2', matches: [{ id: 'gD-m2', player1: 'Luca Siciliani', player2: 'Vittorio Sisto' }] },
        { raceId: 'Gara3', matches: [{ id: 'gD-m3', player1: 'Vittorio Sisto', player2: 'Piergiorgio Tunzi' }] },
        { raceId: 'Gara4', matches: [{ id: 'gD-m4', player1: 'Luca Siciliani', player2: 'Piergiorgio Tunzi' }] },
        { raceId: 'Gara5', matches: [{ id: 'gD-m5', player1: 'Vittorio Sisto', player2: 'Luca Siciliani' }] },
        { raceId: 'Gara6', matches: [{ id: 'gD-m6', player1: 'Piergiorgio Tunzi', player2: 'Vittorio Sisto' }] },
      ],
    }
  ],
  bracket: {
    quarterFinals: {
      raceId: 'Gara7',
      matches: [
        { id: 'qf-1', player1: null, player2: null },
        { id: 'qf-2', player1: null, player2: null },
        { id: 'qf-3', player1: null, player2: null },
        { id: 'qf-4', player1: null, player2: null },
      ],
    },
    semiFinals: {
      raceId: 'Gara8',
      matches: [
        { id: 'sf-1', player1: null, player2: null },
        { id: 'sf-2', player1: null, player2: null },
      ],
    },
    final: {
      raceId: 'Gara9',
      matches: [
        { id: 'f-1', player1: null, player2: null },
      ],
    }
  }
};
