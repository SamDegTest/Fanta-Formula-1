export type User = {
  id: string;
  username: string;
};

export type Team = {
  id: string;
  userId: string;
  name: string;
  points: number;
};

export type Cup = {
  id: string;
  name: string;
  threshold: number;
};

export type Group = {
  id: string;
  cupId: string;
  name: string;
};

export type GroupParticipant = {
  id: string;
  groupId: string;
  userId: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
};

export type Matchday = {
  id: string;
  cupId: string;
  gpNumber: number; // e.g., 12 for GP 12
  name: string; // e.g., "Group Stage - Matchday 1"
};

export type Match = {
  id: string;
  matchdayId: string;
  userAId: string;
  userBId: string;
  scoreA: number | null;
  scoreB: number | null;
  status: 'SCHEDULED' | 'COMPLETED';
};

// Example JSON Schema representation for a NoSQL DB (like Firebase) or structured JSON
export const dbSchemaJSON = {
  "users": [
    { "id": "u1", "username": "Mario" }
  ],
  "cups": [
    { "id": "c1", "name": "Coppa di Lega 2024", "threshold": 5 }
  ],
  "groups": [
    { "id": "g1", "cupId": "c1", "name": "Girone A" }
  ],
  "group_participants": [
    {
      "id": "gp1",
      "groupId": "g1",
      "userId": "u1",
      "points": 0,
      "played": 0,
      "won": 0,
      "drawn": 0,
      "lost": 0,
      "pointsFor": 0,
      "pointsAgainst": 0
    }
  ],
  "matchdays": [
    { "id": "md1", "cupId": "c1", "gpNumber": 12, "name": "Giornata 1" }
  ],
  "matches": [
    {
      "id": "m1",
      "matchdayId": "md1",
      "userAId": "u1",
      "userBId": "u2",
      "scoreA": null,
      "scoreB": null,
      "status": "SCHEDULED"
    }
  ]
};

// Example SQL Schema representation for a Relational DB (like Supabase/PostgreSQL)
export const dbSchemaSQL = `
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL
);

CREATE TABLE cups (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  threshold NUMERIC NOT NULL DEFAULT 5
);

CREATE TABLE groups (
  id UUID PRIMARY KEY,
  cup_id UUID REFERENCES cups(id),
  name TEXT NOT NULL
);

CREATE TABLE group_participants (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES groups(id),
  user_id UUID REFERENCES users(id),
  points INT DEFAULT 0,
  played INT DEFAULT 0,
  won INT DEFAULT 0,
  drawn INT DEFAULT 0,
  lost INT DEFAULT 0,
  points_for NUMERIC DEFAULT 0,
  points_against NUMERIC DEFAULT 0
);

CREATE TABLE matchdays (
  id UUID PRIMARY KEY,
  cup_id UUID REFERENCES cups(id),
  gp_number INT NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE matches (
  id UUID PRIMARY KEY,
  matchday_id UUID REFERENCES matchdays(id),
  user_a_id UUID REFERENCES users(id),
  user_b_id UUID REFERENCES users(id),
  score_a NUMERIC,
  score_b NUMERIC,
  status TEXT DEFAULT 'SCHEDULED'
);
`;
