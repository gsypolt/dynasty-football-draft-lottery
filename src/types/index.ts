export interface Team {
  id: string;
  name: string;
  logoUrl: string;
  logoType: 'url' | 'upload';
}

export interface DraftConfig {
  numberOfTeams: number;
  numberOfRounds: number;
  teams: Team[];
  weightedSystem: WeightedOdds[];
  pickDelaySeconds: number;
  currentYear: number;
  initialOrder?: number[]; // Saved initial draft order (optional)
}

export interface WeightedOdds {
  position: number; // Original position (1-10, where 10 is worst team)
  percentage: number; // Percentage out of 1000 "balls"
}

export interface DraftPick {
  round: number;
  pickNumber: number;
  teamId: string;
  originalPosition: number;
  movement: number; // Negative means moved up, positive means moved down, 0 means stayed
}

export interface DraftLottery {
  id: string;
  year: number;
  date: string;
  picks: DraftPick[];
  config: DraftConfig;
}

export interface DatabaseSchema {
  config: DraftConfig;
  lotteries: DraftLottery[];
}
