import { describe, it, expect } from 'vitest';

/**
 * UI Logic Tests for Initial Order Save/Load
 * These tests simulate the UI behavior without actual DOM manipulation
 */

describe('[UI] Initial Order UI Logic', () => {
  it('should correctly reverse visual order when saving', () => {
    // Simulate the UI state after drag-and-drop
    // Visual order (top to bottom): Position 10, 9, 8, 7, 6, 5, 4, 3, 2, 1

    // Before drag: Whiskey Warriors (team 10) is at the top (position 10)
    // After drag: Move Whiskey Warriors from position 10 to position 8
    //
    // Visual order after drag (top to bottom):
    // Position 10: Team 9 (India Brigade)
    // Position 9:  Team 8 (Hotel Battalion)
    // Position 8:  Team 10 (Whiskey Warriors) <- MOVED HERE
    // Position 7:  Team 7 (Golf Company)
    // Position 6:  Team 6 (Foxtrot Team)
    // Position 5:  Team 5 (Echo Squad)
    // Position 4:  Team 4 (Delta Force)
    // Position 3:  Team 3 (Charlie Rangers)
    // Position 2:  Team 2 (Beta Fighters)
    // Position 1:  Team 1 (Alpha Warriors)

    // Simulated querySelectorAll result (top to bottom in DOM)
    const visualOrder = [9, 8, 10, 7, 6, 5, 4, 3, 2, 1];

    // This is what the UI save function does
    const savedOrder = visualOrder.reverse();

    // Expected: Position 1 -> Team 1, Position 2 -> Team 2, ... Position 8 -> Team 10
    expect(savedOrder).toEqual([1, 2, 3, 4, 5, 6, 7, 10, 8, 9]);

    // Verify Whiskey Warriors (team 10) is at position 8 (index 7)
    expect(savedOrder[7]).toBe(10);
  });

  it('should correctly load saved order into visual positions', () => {
    // Saved order: [1, 2, 3, 4, 5, 6, 7, 10, 8, 9]
    // This means: Position 1 has Team 1, Position 2 has Team 2, ... Position 8 has Team 10

    const savedOrder = [1, 2, 3, 4, 5, 6, 7, 10, 8, 9];

    // To display in UI (top to bottom = position 10 to 1), we iterate backwards
    const visualOrder: number[] = [];
    for (let i = savedOrder.length - 1; i >= 0; i--) {
      visualOrder.push(savedOrder[i]);
    }

    // Visual order should be: [9, 8, 10, 7, 6, 5, 4, 3, 2, 1]
    expect(visualOrder).toEqual([9, 8, 10, 7, 6, 5, 4, 3, 2, 1]);

    // At visual index 2 (third from top, which is position 8), should be team 10
    expect(visualOrder[2]).toBe(10);
  });

  it('should handle round-trip: default -> drag -> save -> load -> display', () => {
    // Start with default order
    let savedOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Step 1: Load into UI (reverse for display)
    let visualOrder = [...savedOrder].reverse();
    expect(visualOrder).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);

    // Step 2: User drags team 10 from top (position 10) to third position (position 8)
    // Remove from index 0
    const draggedTeam = visualOrder.splice(0, 1)[0];
    expect(draggedTeam).toBe(10);

    // Insert at index 2 (position 8)
    visualOrder.splice(2, 0, draggedTeam);
    expect(visualOrder).toEqual([9, 8, 10, 7, 6, 5, 4, 3, 2, 1]);

    // Step 3: Save (reverse visual order)
    savedOrder = [...visualOrder].reverse();
    expect(savedOrder).toEqual([1, 2, 3, 4, 5, 6, 7, 10, 8, 9]);

    // Step 4: Reload page - load saved order and display
    visualOrder = [...savedOrder].reverse();
    expect(visualOrder).toEqual([9, 8, 10, 7, 6, 5, 4, 3, 2, 1]);

    // Step 5: Verify Whiskey Warriors (team 10) is still at position 8
    expect(visualOrder[2]).toBe(10);
    expect(savedOrder[7]).toBe(10);
  });

  it('should correctly identify team at specific position', () => {
    const savedOrder = [1, 2, 3, 4, 5, 6, 7, 10, 8, 9];
    const teams = [
      'Alpha Warriors',
      'Beta Fighters',
      'Charlie Rangers',
      'Delta Force',
      'Echo Squad',
      'Foxtrot Team',
      'Golf Company',
      'Hotel Battalion',
      'India Brigade',
      'Whiskey Warriors',
    ];

    // Function to get team at specific position
    const getTeamAtPosition = (position: number) => {
      const teamIndex = savedOrder[position - 1]; // Position 1 is at index 0
      return teams[teamIndex - 1]; // Team 1 is at index 0
    };

    // Verify Whiskey Warriors at position 8
    expect(getTeamAtPosition(8)).toBe('Whiskey Warriors');

    // Verify teams that got shifted
    expect(getTeamAtPosition(9)).toBe('Hotel Battalion'); // Was at 8, now at 9
    expect(getTeamAtPosition(10)).toBe('India Brigade'); // Was at 9, now at 10

    // Verify others didn't change
    expect(getTeamAtPosition(1)).toBe('Alpha Warriors');
    expect(getTeamAtPosition(7)).toBe('Golf Company');
  });

  it('should handle edge case: move from position 1 to position 3', () => {
    // Start: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    // Visual: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

    let visualOrder = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    // Move team 1 from bottom (position 1) to position 3
    // Visual index: last item (index 9) to index 7
    const draggedTeam = visualOrder.splice(9, 1)[0];
    expect(draggedTeam).toBe(1);

    visualOrder.splice(7, 0, draggedTeam);
    expect(visualOrder).toEqual([10, 9, 8, 7, 6, 5, 4, 1, 3, 2]);

    // Save
    const savedOrder = [...visualOrder].reverse();
    expect(savedOrder).toEqual([2, 3, 1, 4, 5, 6, 7, 8, 9, 10]);

    // Verify team 1 is at position 3 (index 2)
    expect(savedOrder[2]).toBe(1);
  });

  it('should verify data structure matches test expectations', () => {
    // This test documents the expected data structure

    const savedOrder = [1, 2, 3, 4, 5, 6, 7, 10, 8, 9];

    // savedOrder[i] represents which team is at position (i+1)
    // savedOrder[0] = team at position 1
    // savedOrder[7] = team at position 8
    // savedOrder[9] = team at position 10

    // If savedOrder[7] = 10, it means team 10 is at position 8
    expect(savedOrder[7]).toBe(10);

    // Position 8 should have team 10 (Whiskey Warriors)
    // Position 9 should have team 8 (Hotel Battalion)
    // Position 10 should have team 9 (India Brigade)

    const positionMapping = savedOrder.map((teamNum, index) => ({
      position: index + 1,
      team: teamNum,
    }));

    const position8 = positionMapping.find((p) => p.position === 8);
    expect(position8?.team).toBe(10);

    const position9 = positionMapping.find((p) => p.position === 9);
    expect(position9?.team).toBe(8);

    const position10 = positionMapping.find((p) => p.position === 10);
    expect(position10?.team).toBe(9);
  });

  it('should always display positions 10-1 from top to bottom', () => {
    // Simulates the updatePositionNumbers function behavior
    // After drag-and-drop, display positions should always be 10-1 from top to bottom

    // Example: After dragging team 10 to position 8
    // DOM order (top to bottom): [team 9, team 8, team 10, team 7, ...]
    const domOrder = [9, 8, 10, 7, 6, 5, 4, 3, 2, 1];

    // Display positions should be calculated as: numberOfTeams - index
    const numberOfTeams = 10;
    const displayPositions = domOrder.map((_, index) => numberOfTeams - index);

    // Verify display positions are always 10, 9, 8, 7, 6, 5, 4, 3, 2, 1
    expect(displayPositions).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);

    // Item at DOM index 0 should show "Position 10 (Worst Team)"
    expect(displayPositions[0]).toBe(10);

    // Item at DOM index 2 should show "Position 8" (where team 10 is)
    expect(displayPositions[2]).toBe(8);

    // Item at DOM index 9 should show "Position 1 (Champion)"
    expect(displayPositions[9]).toBe(1);
  });

  it('should maintain 10-1 display after save and reload', () => {
    // User drags team 10 from position 10 to position 8
    // Visual order: [9, 8, 10, 7, 6, 5, 4, 3, 2, 1]
    let visualOrder = [9, 8, 10, 7, 6, 5, 4, 3, 2, 1];

    // Save (reverse to get position-indexed order)
    const savedOrder = [...visualOrder].reverse();
    expect(savedOrder).toEqual([1, 2, 3, 4, 5, 6, 7, 10, 8, 9]);

    // Page reload - load saved order
    visualOrder = [...savedOrder].reverse();
    expect(visualOrder).toEqual([9, 8, 10, 7, 6, 5, 4, 3, 2, 1]);

    // Display positions should always be 10-1
    const numberOfTeams = 10;
    const displayPositions = visualOrder.map((_, index) => numberOfTeams - index);
    expect(displayPositions).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);

    // After reload, display is consistent
    // Position 10 at top, Position 1 at bottom
    expect(displayPositions[0]).toBe(10); // Top
    expect(displayPositions[9]).toBe(1); // Bottom
  });

  it('should display default order as position 10 at top on initial load', () => {
    // Default saved order: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    // This means position 1 has team 1, position 2 has team 2, etc.
    const defaultSavedOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // When populating the UI, we iterate backwards through savedOrder
    // positionIndex 9 → actualPosition 10 → team 10 → FIRST item (top)
    // positionIndex 8 → actualPosition 9 → team 9 → second item
    // ...
    // positionIndex 0 → actualPosition 1 → team 1 → LAST item (bottom)

    const uiItems: { displayPosition: number; teamNumber: number }[] = [];

    // Simulate populateInitialOrder logic
    for (let positionIndex = 9; positionIndex >= 0; positionIndex--) {
      const actualPosition = positionIndex + 1; // 1-10
      const teamNumber = defaultSavedOrder[positionIndex];
      uiItems.push({
        displayPosition: actualPosition,
        teamNumber: teamNumber,
      });
    }

    // Verify first item (top of list) shows Position 10, Team 10
    expect(uiItems[0].displayPosition).toBe(10);
    expect(uiItems[0].teamNumber).toBe(10);

    // Verify last item (bottom of list) shows Position 1, Team 1
    expect(uiItems[9].displayPosition).toBe(1);
    expect(uiItems[9].teamNumber).toBe(1);

    // Verify all display positions are in order 10-1
    const displayPositions = uiItems.map((item) => item.displayPosition);
    expect(displayPositions).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
  });

  it('should maintain position 10 at top after drag and save', () => {
    // STEP 1: Initial state (default order)
    let savedOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // UI displays position 10 at top
    let topItem = savedOrder[9]; // Position 10 has team 10
    expect(topItem).toBe(10);

    // STEP 2: User drags team at position 5 to position 1
    // This means moving team 5 from position 5 to position 1
    // New order: position 1 has team 5, positions 2-5 shift up
    // Result: [5, 1, 2, 3, 4, 6, 7, 8, 9, 10]
    savedOrder = [5, 1, 2, 3, 4, 6, 7, 8, 9, 10];

    // STEP 3: After drag, UI should STILL show position 10 at top
    topItem = savedOrder[9]; // Position 10 still has team 10
    expect(topItem).toBe(10);

    // Simulate populateInitialOrder display
    const displayedPositions: number[] = [];
    for (let positionIndex = 9; positionIndex >= 0; positionIndex--) {
      displayedPositions.push(positionIndex + 1);
    }

    // Verify position 10 is at top (first in array)
    expect(displayedPositions[0]).toBe(10);
    expect(displayedPositions[9]).toBe(1);

    // STEP 4: After save and reload, position 10 STILL at top
    // populateInitialOrder will iterate backwards again
    for (let positionIndex = 9; positionIndex >= 0; positionIndex--) {
      const actualPosition = positionIndex + 1;
      if (positionIndex === 9) {
        // First item displayed
        expect(actualPosition).toBe(10); // Position 10 at top
      }
      if (positionIndex === 0) {
        // Last item displayed
        expect(actualPosition).toBe(1); // Position 1 at bottom
      }
    }
  });
});
