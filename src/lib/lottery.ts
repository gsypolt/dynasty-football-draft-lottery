import type { DraftConfig, DraftPick, WeightedOdds } from '../types';

/**
 * Maximum number of spots a team can move up or down in the draft
 */
const MAX_MOVEMENT = 2;

/**
 * Calculates the valid range for a team's final position based on the 2-spot rule
 */
export function getValidPositionRange(originalPosition: number, totalTeams: number): {
  min: number;
  max: number;
} {
  return {
    min: Math.max(1, originalPosition - MAX_MOVEMENT),
    max: Math.min(totalTeams, originalPosition + MAX_MOVEMENT),
  };
}

/**
 * Validates that a draft result respects the 2-spot movement constraint
 */
export function validateDraftResults(picks: DraftPick[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  picks.forEach((pick) => {
    const movement = Math.abs(pick.movement);
    if (movement > MAX_MOVEMENT) {
      errors.push(
        `Team at original position ${pick.originalPosition} moved ${movement} spots (max allowed: ${MAX_MOVEMENT})`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Performs a weighted random selection based on the weighted odds system
 * Returns the selected position
 */
export function weightedRandomSelection(
  availablePositions: number[],
  weightedSystem: WeightedOdds[],
  originalPosition: number
): number {
  // Get valid positions for this team (within 2 spots)
  const validRange = getValidPositionRange(originalPosition, weightedSystem.length);
  const validPositions = availablePositions.filter(
    (pos) => pos >= validRange.min && pos <= validRange.max
  );

  if (validPositions.length === 0) {
    throw new Error(
      `No valid positions available for team at original position ${originalPosition}`
    );
  }

  // If only one valid position, return it
  if (validPositions.length === 1) {
    return validPositions[0];
  }

  // Find the weighted odds for this original position
  const teamOdds = weightedSystem.find((odds) => odds.position === originalPosition);
  if (!teamOdds) {
    throw new Error(`No weighted odds found for position ${originalPosition}`);
  }

  // Calculate probabilities for each valid position
  // Teams prefer to move up, so weight accordingly
  const probabilities: { position: number; weight: number }[] = validPositions.map((pos) => {
    const movement = originalPosition - pos; // Positive = moving up
    let weight = teamOdds.percentage;

    if (movement > 0) {
      // Moving up - increase weight
      weight *= 1 + movement * 0.2;
    } else if (movement < 0) {
      // Moving down - decrease weight
      weight *= 1 - Math.abs(movement) * 0.2;
    }

    return { position: pos, weight };
  });

  // Normalize weights
  const totalWeight = probabilities.reduce((sum, p) => sum + p.weight, 0);
  const normalizedProbs = probabilities.map((p) => ({
    position: p.position,
    probability: p.weight / totalWeight,
  }));

  // Random selection
  const random = Math.random();
  let cumulative = 0;

  for (const prob of normalizedProbs) {
    cumulative += prob.probability;
    if (random <= cumulative) {
      return prob.position;
    }
  }

  // Fallback (should never reach here)
  return validPositions[0];
}

/**
 * Runs the draft lottery for a single round using a constraint-satisfaction algorithm
 * that guarantees the 2-spot movement constraint is respected
 */
export function runLotteryRound(
  config: DraftConfig,
  roundNumber: number,
  initialOrder: number[]
): DraftPick[] {
  const MAX_ATTEMPTS = 1000;
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    attempt++;

    try {
      const picks: DraftPick[] = [];
      const assignedPositions = new Set<number>();

      // Create list of teams with their original positions
      const teams = initialOrder.map((originalPosition) => ({
        originalPosition,
        teamId: config.teams[originalPosition - 1].id,
      }));

      // Shuffle teams randomly to vary the processing order
      const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

      // Process teams in random order
      for (const team of shuffledTeams) {
        const availablePositions = Array.from(
          { length: config.numberOfTeams },
          (_, i) => i + 1
        ).filter((pos) => !assignedPositions.has(pos));

        // Get valid positions within 2-spot range
        const validRange = getValidPositionRange(team.originalPosition, config.numberOfTeams);
        const validPositions = availablePositions.filter(
          (pos) => pos >= validRange.min && pos <= validRange.max
        );

        if (validPositions.length === 0) {
          // No valid positions available, restart the lottery
          throw new Error('No valid positions');
        }

        // Weighted random selection from valid positions
        const selectedPosition = weightedRandomSelection(
          availablePositions,
          config.weightedSystem,
          team.originalPosition
        );

        assignedPositions.add(selectedPosition);

        const movement = selectedPosition - team.originalPosition;

        picks.push({
          round: roundNumber,
          pickNumber: selectedPosition,
          teamId: team.teamId,
          originalPosition: team.originalPosition,
          movement,
        });
      }

      // Validate all picks respect the 2-spot constraint
      const allValid = picks.every((pick) => Math.abs(pick.movement) <= MAX_MOVEMENT);

      if (allValid) {
        // Sort picks by pick number and return
        return picks.sort((a, b) => a.pickNumber - b.pickNumber);
      }
    } catch (error) {
      // Continue to next attempt
    }
  }

  // If we couldn't generate a valid lottery after MAX_ATTEMPTS, fall back to no movement
  return initialOrder.map((originalPosition) => ({
    round: roundNumber,
    pickNumber: originalPosition,
    teamId: config.teams[originalPosition - 1].id,
    originalPosition,
    movement: 0,
  })).sort((a, b) => a.pickNumber - b.pickNumber);
}

/**
 * Runs the complete draft lottery for all rounds
 */
export function runCompleteLottery(config: DraftConfig, initialOrder: number[]): DraftPick[] {
  if (initialOrder.length !== config.numberOfTeams) {
    throw new Error(
      `Initial order length (${initialOrder.length}) must match number of teams (${config.numberOfTeams})`
    );
  }

  const allPicks: DraftPick[] = [];

  for (let round = 1; round <= config.numberOfRounds; round++) {
    const roundPicks = runLotteryRound(config, round, initialOrder);

    // Validate round picks
    const validation = validateDraftResults(roundPicks);
    if (!validation.valid) {
      throw new Error(`Invalid lottery results for round ${round}: ${validation.errors.join(', ')}`);
    }

    allPicks.push(...roundPicks);
  }

  return allPicks;
}
