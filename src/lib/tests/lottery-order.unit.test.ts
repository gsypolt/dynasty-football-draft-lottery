import { describe, it, expect, beforeEach } from 'vitest';
import { Database } from '../database';
import type { DraftConfig } from '../../types';

describe('[UNIT] Initial Order Save and Load', () => {
  let testConfig: DraftConfig;

  beforeEach(async () => {
    // Get a fresh config
    testConfig = await Database.getConfig();

    // Ensure we have test teams
    if (testConfig.teams.length === 0) {
      testConfig.teams = [
        { id: 'team-1', name: 'Alpha Warriors', logoUrl: '', logoType: 'url' },
        { id: 'team-2', name: 'Beta Fighters', logoUrl: '', logoType: 'url' },
        { id: 'team-3', name: 'Charlie Rangers', logoUrl: '', logoType: 'url' },
        { id: 'team-4', name: 'Delta Force', logoUrl: '', logoType: 'url' },
        { id: 'team-5', name: 'Echo Squad', logoUrl: '', logoType: 'url' },
        { id: 'team-6', name: 'Foxtrot Team', logoUrl: '', logoType: 'url' },
        { id: 'team-7', name: 'Golf Company', logoUrl: '', logoType: 'url' },
        { id: 'team-8', name: 'Hotel Battalion', logoUrl: '', logoType: 'url' },
        { id: 'team-9', name: 'India Brigade', logoUrl: '', logoType: 'url' },
        { id: 'team-10', name: 'Whiskey Warriors', logoUrl: '', logoType: 'url' },
      ];
      testConfig.numberOfTeams = 10;
    }
  });

  it('should save and load default order (1-10)', async () => {
    // Save default order
    testConfig.initialOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    await Database.updateConfig(testConfig);

    // Load and verify
    const loadedConfig = await Database.getConfig();
    expect(loadedConfig.initialOrder).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should save and preserve custom order when Whiskey Warriors moves from position 10 to position 8', async () => {
    // Initial order: positions 1-10 in order
    // Team 10 (Whiskey Warriors) is at position 10
    const initialOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // After drag-and-drop: Whiskey Warriors (team-10) moves from position 10 to position 8
    // This means the array should represent which team is at each position:
    // Position 1: team 1, Position 2: team 2, ... Position 8: team 10, Position 9: team 8, Position 10: team 9
    const newOrder = [1, 2, 3, 4, 5, 6, 7, 10, 8, 9];

    // Save the new order
    testConfig.initialOrder = newOrder;
    await Database.updateConfig(testConfig);

    // Load and verify the order persisted
    const loadedConfig = await Database.getConfig();
    expect(loadedConfig.initialOrder).toBeDefined();
    expect(loadedConfig.initialOrder).toEqual(newOrder);

    // Verify Whiskey Warriors (team-10) is at position 8
    expect(loadedConfig.initialOrder![7]).toBe(10); // Index 7 is position 8

    // Verify teams that shifted down
    expect(loadedConfig.initialOrder![8]).toBe(8); // Team 8 moved to position 9
    expect(loadedConfig.initialOrder![9]).toBe(9); // Team 9 moved to position 10
  });

  it('should correctly map team names to positions after drag-and-drop', async () => {
    // Ensure we have our test teams
    testConfig.teams = [
      { id: 'team-1', name: 'Alpha Warriors', logoUrl: '', logoType: 'url' },
      { id: 'team-2', name: 'Beta Fighters', logoUrl: '', logoType: 'url' },
      { id: 'team-3', name: 'Charlie Rangers', logoUrl: '', logoType: 'url' },
      { id: 'team-4', name: 'Delta Force', logoUrl: '', logoType: 'url' },
      { id: 'team-5', name: 'Echo Squad', logoUrl: '', logoType: 'url' },
      { id: 'team-6', name: 'Foxtrot Team', logoUrl: '', logoType: 'url' },
      { id: 'team-7', name: 'Golf Company', logoUrl: '', logoType: 'url' },
      { id: 'team-8', name: 'Hotel Battalion', logoUrl: '', logoType: 'url' },
      { id: 'team-9', name: 'India Brigade', logoUrl: '', logoType: 'url' },
      { id: 'team-10', name: 'Whiskey Warriors', logoUrl: '', logoType: 'url' },
    ];

    // Create a specific order where Whiskey Warriors is at position 8
    const customOrder = [1, 2, 3, 4, 5, 6, 7, 10, 8, 9];

    testConfig.initialOrder = customOrder;
    await Database.updateConfig(testConfig);

    const loadedConfig = await Database.getConfig();

    // Helper function to get team at position
    const getTeamAtPosition = (position: number) => {
      const teamIndex = loadedConfig.initialOrder![position - 1];
      return loadedConfig.teams[teamIndex - 1];
    };

    // Verify Whiskey Warriors is at position 8
    const teamAtPosition8 = getTeamAtPosition(8);
    expect(teamAtPosition8.name).toBe('Whiskey Warriors');

    // Verify other teams
    expect(getTeamAtPosition(1).name).toBe('Alpha Warriors');
    expect(getTeamAtPosition(7).name).toBe('Golf Company');
    expect(getTeamAtPosition(9).name).toBe('Hotel Battalion');
    expect(getTeamAtPosition(10).name).toBe('India Brigade');
  });

  it('should handle multiple order changes', async () => {
    // First change: Whiskey Warriors to position 8
    testConfig.initialOrder = [1, 2, 3, 4, 5, 6, 7, 10, 8, 9];
    await Database.updateConfig(testConfig);

    let loadedConfig = await Database.getConfig();
    expect(loadedConfig.initialOrder![7]).toBe(10);

    // Second change: Move Alpha Warriors to position 3
    testConfig.initialOrder = [2, 3, 1, 4, 5, 6, 7, 10, 8, 9];
    await Database.updateConfig(testConfig);

    loadedConfig = await Database.getConfig();
    expect(loadedConfig.initialOrder![2]).toBe(1); // Alpha at position 3
    expect(loadedConfig.initialOrder![7]).toBe(10); // Whiskey still at position 8
  });

  it('should default to standard order when initialOrder is undefined', async () => {
    // Remove initialOrder
    testConfig.initialOrder = undefined;
    await Database.updateConfig(testConfig);

    const loadedConfig = await Database.getConfig();

    // Should be undefined or create default in UI
    expect(loadedConfig.initialOrder).toBeUndefined();
  });

  it('should preserve initialOrder through multiple config updates', async () => {
    // Set initial order
    testConfig.initialOrder = [1, 2, 3, 4, 5, 6, 7, 10, 8, 9];
    await Database.updateConfig(testConfig);

    // Update something else (e.g., pick delay)
    testConfig.pickDelaySeconds = 5;
    await Database.updateConfig(testConfig);

    // Verify initial order is still preserved
    const loadedConfig = await Database.getConfig();
    expect(loadedConfig.initialOrder).toEqual([1, 2, 3, 4, 5, 6, 7, 10, 8, 9]);
    expect(loadedConfig.pickDelaySeconds).toBe(5);
  });
});
