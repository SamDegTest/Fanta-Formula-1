export interface Participant {
  username: string;
}

export interface Match {
  player1: Participant;
  player2: Participant | null;
}

export interface Group {
  name: string;
  participants: Participant[];
}

export interface KnockoutRound {
  name:string;
  matches: Match[];
}

export interface Bracket {
  type: 'groups' | 'knockout';
  groups: Group[] | null;
  knockout: {
    rounds: KnockoutRound[];
  } | null;
}
