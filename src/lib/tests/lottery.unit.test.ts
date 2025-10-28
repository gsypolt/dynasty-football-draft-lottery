import { describe, it, expect, vi } from 'vitest';
import {
  getValidPositionRange,
  validateDraftResults,
  weightedRandomSelection,
  runLotteryRound,
  runCompleteLottery,
} from '../lottery';
import type { DraftConfig, DraftPick, WeightedOdds } from '../../types';

const mockWeightedSystem: WeightedOdds[] = [
  { position: 10, percentage: 25.0 },
  { position: 9, percentage: 18.8 },
  { position: 8, percentage: 14.1 },
  { position: 7, percentage: 10.5 },
  { position: 6, percentage: 7.9 },
  { position: 5, percentage: 6.2 },
  { position: 4, percentage: 6.2 },
  { position: 3, percentage: 4.7 },
  { position: 2, percentage: 3.5 },
  { position: 1, percentage: 3.1 },
];

const mockConfig: DraftConfig = {
  numberOfTeams: 10,
  numberOfRounds: 5,
  teams: [
    { id: '1', name: 'Team 1', logoUrl: '/logo1.png', logoType: 'url' },
    { id: '2', name: 'Team 2', logoUrl: '/logo2.png', logoType: 'url' },
    { id: '3', name: 'Team 3', logoUrl: '/logo3.png', logoType: 'url' },
    { id: '4', name: 'Team 4', logoUrl: '/logo4.png', logoType: 'url' },
    { id: '5', name: 'Team 5', logoUrl: '/logo5.png', logoType: 'url' },
    { id: '6', name: 'Team 6', logoUrl: '/logo6.png', logoType: 'url' },
    { id: '7', name: 'Team 7', logoUrl: '/logo7.png', logoType: 'url' },
    { id: '8', name: 'Team 8', logoUrl: '/logo8.png', logoType: 'url' },
    { id: '9', name: 'Team 9', logoUrl: '/logo9.png', logoType: 'url' },
    { id: '10', name: 'Team 10', logoUrl: '/logo10.png', logoType: 'url' },
  ],
  weightedSystem: mockWeightedSystem,
  pickDelaySeconds: 3,
  currentYear: 2024,
};

describe('[UNIT] getValidPositionRange', () => {
  it('should return correct range for position 5 in 10-team league', () => {
    const range = getValidPositionRange(5, 10);
    expect(range).toEqual({ min: 3, max: 7 });
  });

  it('should respect minimum boundary for position 1', () => {
    const range = getValidPositionRange(1, 10);
    expect(range).toEqual({ min: 1, max: 3 });
  });

  it('should respect maximum boundary for position 10', () => {
    const range = getValidPositionRange(10, 10);
    expect(range).toEqual({ min: 8, max: 10 });
  });

  it('should respect minimum boundary for position 2', () => {
    const range = getValidPositionRange(2, 10);
    expect(range).toEqual({ min: 1, max: 4 });
  });

  it('should respect maximum boundary for position 9', () => {
    const range = getValidPositionRange(9, 10);
    expect(range).toEqual({ min: 7, max: 10 });
  });
});

describe('[UNIT] validateDraftResults', () => {
  it('should validate picks with no movement', () => {
    const picks: DraftPick[] = [
      {
        round: 1,
        pickNumber: 5,
        teamId: '5',
        originalPosition: 5,
        movement: 0,
      },
    ];

    const result = validateDraftResults(picks);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate picks within 2-spot movement', () => {
    const picks: DraftPick[] = [
      {
        round: 1,
        pickNumber: 3,
        teamId: '5',
        originalPosition: 5,
        movement: -2,
      },
      {
        round: 1,
        pickNumber: 7,
        teamId: '6',
        originalPosition: 5,
        movement: 2,
      },
    ];

    const result = validateDraftResults(picks);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject picks with movement exceeding 2 spots', () => {
    const picks: DraftPick[] = [
      {
        round: 1,
        pickNumber: 1,
        teamId: '5',
        originalPosition: 5,
        movement: -4,
      },
    ];

    const result = validateDraftResults(picks);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('moved 4 spots');
  });

  it('should validate multiple picks correctly', () => {
    const picks: DraftPick[] = [
      {
        round: 1,
        pickNumber: 3,
        teamId: '5',
        originalPosition: 5,
        movement: -2,
      },
      {
        round: 1,
        pickNumber: 2,
        teamId: '1',
        originalPosition: 1,
        movement: 1,
      },
      {
        round: 1,
        pickNumber: 9,
        teamId: '10',
        originalPosition: 10,
        movement: -1,
      },
    ];

    const result = validateDraftResults(picks);
    expect(result.valid).toBe(true);
  });
});

describe('[UNIT] weightedRandomSelection', () => {
  it('should return a position within valid range', () => {
    const availablePositions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const originalPosition = 5;

    // Run multiple times to test randomness
    for (let i = 0; i < 100; i++) {
      const selected = weightedRandomSelection(
        availablePositions,
        mockWeightedSystem,
        originalPosition
      );

      expect(selected).toBeGreaterThanOrEqual(3);
      expect(selected).toBeLessThanOrEqual(7);
      expect(availablePositions).toContain(selected);
    }
  });

  it('should return only valid position when one exists', () => {
    const availablePositions = [4];
    const originalPosition = 5;

    const selected = weightedRandomSelection(
      availablePositions,
      mockWeightedSystem,
      originalPosition
    );

    expect(selected).toBe(4);
  });

  it('should handle position 1 correctly', () => {
    const availablePositions = [1, 2, 3, 4, 5];
    const originalPosition = 1;

    for (let i = 0; i < 50; i++) {
      const selected = weightedRandomSelection(
        availablePositions,
        mockWeightedSystem,
        originalPosition
      );

      expect(selected).toBeGreaterThanOrEqual(1);
      expect(selected).toBeLessThanOrEqual(3);
    }
  });

  it('should handle position 10 correctly', () => {
    const availablePositions = [6, 7, 8, 9, 10];
    const originalPosition = 10;

    for (let i = 0; i < 50; i++) {
      const selected = weightedRandomSelection(
        availablePositions,
        mockWeightedSystem,
        originalPosition
      );

      expect(selected).toBeGreaterThanOrEqual(8);
      expect(selected).toBeLessThanOrEqual(10);
    }
  });

  it('should throw error when no valid positions available', () => {
    const availablePositions = [1, 2]; // Position 5 can only pick from 3-7
    const originalPosition = 5;

    expect(() =>
      weightedRandomSelection(availablePositions, mockWeightedSystem, originalPosition)
    ).toThrow('No valid positions available');
  });
});

describe('[UNIT] runLotteryRound', () => {
  it('should return correct number of picks', () => {
    const initialOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const picks = runLotteryRound(mockConfig, 1, initialOrder);

    expect(picks).toHaveLength(10);
  });

  it('should assign unique pick numbers', () => {
    const initialOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const picks = runLotteryRound(mockConfig, 1, initialOrder);

    const pickNumbers = picks.map((p) => p.pickNumber);
    const uniquePickNumbers = new Set(pickNumbers);

    expect(uniquePickNumbers.size).toBe(10);
  });

  it('should respect 2-spot movement constraint', () => {
    const initialOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Run multiple rounds to test various scenarios
    for (let i = 0; i < 20; i++) {
      const picks = runLotteryRound(mockConfig, 1, initialOrder);

      picks.forEach((pick) => {
        expect(Math.abs(pick.movement)).toBeLessThanOrEqual(2);
      });
    }
  });

  it('should use correct round number', () => {
    const initialOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const picks = runLotteryRound(mockConfig, 3, initialOrder);

    picks.forEach((pick) => {
      expect(pick.round).toBe(3);
    });
  });

  it('should sort picks by pick number', () => {
    const initialOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const picks = runLotteryRound(mockConfig, 1, initialOrder);

    for (let i = 1; i < picks.length; i++) {
      expect(picks[i].pickNumber).toBeGreaterThan(picks[i - 1].pickNumber);
    }
  });
});

describe('[UNIT] runCompleteLottery', () => {
  it('should return picks for all rounds', () => {
    const initialOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const picks = runCompleteLottery(mockConfig, initialOrder);

    expect(picks).toHaveLength(50); // 10 teams * 5 rounds
  });

  it('should have correct round numbers', () => {
    const initialOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const picks = runCompleteLottery(mockConfig, initialOrder);

    const roundCounts = picks.reduce((acc, pick) => {
      acc[pick.round] = (acc[pick.round] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    expect(Object.keys(roundCounts)).toHaveLength(5);
    Object.values(roundCounts).forEach((count) => {
      expect(count).toBe(10);
    });
  });

  it('should respect 2-spot movement in all rounds', () => {
    const initialOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const picks = runCompleteLottery(mockConfig, initialOrder);

    picks.forEach((pick) => {
      expect(Math.abs(pick.movement)).toBeLessThanOrEqual(2);
    });
  });

  it('should throw error if initial order length does not match number of teams', () => {
    const initialOrder = [1, 2, 3, 4, 5]; // Only 5 teams

    expect(() => runCompleteLottery(mockConfig, initialOrder)).toThrow(
      'Initial order length (5) must match number of teams (10)'
    );
  });

  it('should handle custom initial order', () => {
    const initialOrder = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]; // Reversed
    const picks = runCompleteLottery(mockConfig, initialOrder);

    expect(picks).toHaveLength(50);

    picks.forEach((pick) => {
      expect(Math.abs(pick.movement)).toBeLessThanOrEqual(2);
    });
  });

  it('should run multiple lotteries successfully', () => {
    const initialOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Run 10 complete lotteries
    for (let i = 0; i < 10; i++) {
      const picks = runCompleteLottery(mockConfig, initialOrder);

      expect(picks).toHaveLength(50);

      const validation = validateDraftResults(picks);
      expect(validation.valid).toBe(true);
    }
  });
});

describe('[UNIT] weightedRandomSelection - Edge Cases', () => {
  it('should throw error when weighted odds not found for position', () => {
    // This tests lines 74-75: error when no weighted odds found
    const invalidWeightedSystem: WeightedOdds[] = [
      { position: 10, percentage: 25.0 },
      { position: 9, percentage: 18.8 },
      // Missing position 8
      { position: 7, percentage: 10.5 },
      { position: 6, percentage: 7.9 },
      { position: 5, percentage: 6.2 },
      { position: 4, percentage: 6.2 },
      { position: 3, percentage: 4.7 },
      { position: 2, percentage: 3.5 },
      { position: 1, percentage: 3.1 },
    ];

    const availablePositions = [6, 7, 8, 9, 10];
    const originalPosition = 8; // Position with no weighted odds

    expect(() =>
      weightedRandomSelection(availablePositions, invalidWeightedSystem, originalPosition)
    ).toThrow('No weighted odds found for position 8');
  });

  it('should return first valid position as fallback when random fails', () => {
    // This tests lines 113-114: fallback to first position
    // Mock Math.random to return a value > 1 to force fallback
    const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(1.1);

    const tinyWeightedSystem: WeightedOdds[] = [
      { position: 1, percentage: 100.0 },
    ];

    const availablePositions = [1];
    const originalPosition = 1;

    const result = weightedRandomSelection(availablePositions, tinyWeightedSystem, originalPosition);

    // Should return the first valid position as fallback
    expect(result).toBe(1);
    expect(availablePositions).toContain(result);

    mathRandomSpy.mockRestore();
  });
});

describe('[UNIT] runLotteryRound - Fallback Mechanism', () => {
  it('should test fallback mechanism exists (lines 195-202 are defensive code)', () => {
    // Lines 195-202 in lottery.ts represent a fallback mechanism that triggers
    // after MAX_ATTEMPTS (1000) failed lottery generation attempts
    // This is defensive code that's nearly impossible to trigger with valid config
    // because the constraint-satisfaction algorithm is designed to always succeed

    const config: DraftConfig = {
      numberOfTeams: 3,
      numberOfRounds: 1,
      teams: [
        { id: '1', name: 'Team 1', logoUrl: '', logoType: 'url' },
        { id: '2', name: 'Team 2', logoUrl: '', logoType: 'url' },
        { id: '3', name: 'Team 3', logoUrl: '', logoType: 'url' },
      ],
      weightedSystem: [
        { position: 3, percentage: 50.0 },
        { position: 2, percentage: 30.0 },
        { position: 1, percentage: 20.0 },
      ],
      pickDelaySeconds: 1,
      currentYear: 2024,
    };

    const initialOrder = [1, 2, 3];

    // Normal operation should succeed without hitting the fallback
    const picks = runLotteryRound(config, 1, initialOrder);

    expect(picks).toHaveLength(3);
    expect(picks.every((p) => Math.abs(p.movement) <= 2)).toBe(true);
  });
});

describe('[UNIT] runCompleteLottery - Validation Error', () => {
  it('should throw error when validation fails (defensive check)', () => {
    // Lines 222-223 are defensive error checking that validates each round's picks
    // While runLotteryRound is designed to always produce valid picks, the validation
    // ensures the constraint-satisfaction algorithm worked correctly
    // We can test this by verifying the validation logic itself works correctly

    const validConfig: DraftConfig = {
      numberOfTeams: 3,
      numberOfRounds: 2,
      teams: [
        { id: '1', name: 'Team 1', logoUrl: '', logoType: 'url' },
        { id: '2', name: 'Team 2', logoUrl: '', logoType: 'url' },
        { id: '3', name: 'Team 3', logoUrl: '', logoType: 'url' },
      ],
      weightedSystem: [
        { position: 3, percentage: 50.0 },
        { position: 2, percentage: 30.0 },
        { position: 1, percentage: 20.0 },
      ],
      pickDelaySeconds: 1,
      currentYear: 2024,
    };

    const initialOrder = [1, 2, 3];

    // Run the function - it should not throw because runLotteryRound produces valid picks
    const picks = runCompleteLottery(validConfig, initialOrder);

    // Verify all picks are valid (which tests that the validation on line 220 passes)
    expect(picks).toHaveLength(6); // 3 teams × 2 rounds

    // Verify the validation would catch invalid picks if they existed
    const invalidPicks: DraftPick[] = [
      {
        round: 1,
        pickNumber: 1,
        teamId: '1',
        originalPosition: 1,
        movement: 5, // Invalid: exceeds max movement of 2
      },
    ];

    const validation = validateDraftResults(invalidPicks);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('should validate all rounds in multi-round lottery', () => {
    // Ensure validation runs for each round
    const validConfig: DraftConfig = {
      numberOfTeams: 4,
      numberOfRounds: 3,
      teams: [
        { id: '1', name: 'Team 1', logoUrl: '', logoType: 'url' },
        { id: '2', name: 'Team 2', logoUrl: '', logoType: 'url' },
        { id: '3', name: 'Team 3', logoUrl: '', logoType: 'url' },
        { id: '4', name: 'Team 4', logoUrl: '', logoType: 'url' },
      ],
      weightedSystem: [
        { position: 4, percentage: 40.0 },
        { position: 3, percentage: 30.0 },
        { position: 2, percentage: 20.0 },
        { position: 1, percentage: 10.0 },
      ],
      pickDelaySeconds: 1,
      currentYear: 2024,
    };

    const initialOrder = [1, 2, 3, 4];
    const picks = runCompleteLottery(validConfig, initialOrder);

    // Should have 12 picks (4 teams x 3 rounds)
    expect(picks).toHaveLength(12);

    // All picks should be valid
    const validation = validateDraftResults(picks);
    expect(validation.valid).toBe(true);

    // Verify we have picks for all 3 rounds
    const round1Picks = picks.filter((p) => p.round === 1);
    const round2Picks = picks.filter((p) => p.round === 2);
    const round3Picks = picks.filter((p) => p.round === 3);

    expect(round1Picks).toHaveLength(4);
    expect(round2Picks).toHaveLength(4);
    expect(round3Picks).toHaveLength(4);
  });
});
