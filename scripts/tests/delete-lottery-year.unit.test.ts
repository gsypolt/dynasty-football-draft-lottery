import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { loadDatabase, saveDatabase, deleteLotteryYear } from '../delete-lottery-year';

// Mock fs module
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

describe('[UNIT] delete-lottery-year script', () => {
  const mockDbPath = '/mock/path/database.json';

  const mockDatabase = {
    config: {
      numberOfTeams: 10,
      numberOfRounds: 3,
      teams: [],
      weightedSystem: [],
      pickDelaySeconds: 5,
      currentYear: 2025,
    },
    lotteries: [
      {
        id: 'lottery-2023',
        year: 2023,
        date: '2023-06-15T23:00:00.000Z',
        picks: [
          {
            round: 1,
            pickNumber: 1,
            teamId: 'team-1',
            originalPosition: 1,
            movement: 0,
          },
        ],
        config: {},
      },
      {
        id: 'lottery-2024',
        year: 2024,
        date: '2024-06-15T23:00:00.000Z',
        picks: [
          {
            round: 1,
            pickNumber: 1,
            teamId: 'team-2',
            originalPosition: 2,
            movement: -1,
          },
        ],
        config: {},
      },
      {
        id: 'lottery-2025',
        year: 2025,
        date: '2025-06-15T23:00:00.000Z',
        picks: [],
        config: {},
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadDatabase', () => {
    it('should load and parse database.json successfully', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockDatabase));

      const result = loadDatabase(mockDbPath);

      expect(existsSync).toHaveBeenCalledWith(mockDbPath);
      expect(readFileSync).toHaveBeenCalledWith(mockDbPath, 'utf-8');
      expect(result).toEqual(mockDatabase);
    });

    it('should exit with error when database file does not exist', () => {
      const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      vi.mocked(existsSync).mockReturnValue(false);

      expect(() => loadDatabase(mockDbPath)).toThrow('process.exit called');
      expect(console.error).toHaveBeenCalledWith(
        '❌ Error: database.json not found at',
        mockDbPath
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should exit with error when database file has invalid JSON', () => {
      const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('invalid json {');

      expect(() => loadDatabase(mockDbPath)).toThrow('process.exit called');
      expect(console.error).toHaveBeenCalledWith(
        '❌ Error: Failed to parse database.json',
        expect.any(Error)
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('saveDatabase', () => {
    it('should save database successfully', () => {
      vi.mocked(writeFileSync).mockImplementation(() => {});

      saveDatabase(mockDatabase, mockDbPath);

      expect(writeFileSync).toHaveBeenCalledWith(
        mockDbPath,
        JSON.stringify(mockDatabase, null, 2),
        'utf-8'
      );
      expect(console.log).toHaveBeenCalledWith('✅ Database saved successfully');
    });

    it('should exit with error when save fails', () => {
      const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      const mockError = new Error('Write failed');
      vi.mocked(writeFileSync).mockImplementation(() => {
        throw mockError;
      });

      expect(() => saveDatabase(mockDatabase, mockDbPath)).toThrow('process.exit called');
      expect(console.error).toHaveBeenCalledWith(
        '❌ Error: Failed to save database.json',
        mockError
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteLotteryYear', () => {
    beforeEach(() => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockDatabase));
      vi.mocked(writeFileSync).mockImplementation(() => {});
    });

    it('should delete lottery for specified year successfully', () => {
      deleteLotteryYear(2023, mockDbPath);

      expect(existsSync).toHaveBeenCalledWith(mockDbPath);
      expect(readFileSync).toHaveBeenCalledWith(mockDbPath, 'utf-8');

      // Verify the database was saved with the lottery removed
      expect(writeFileSync).toHaveBeenCalled();
      const savedData = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      const savedDb = JSON.parse(savedData);

      expect(savedDb.lotteries).toHaveLength(2);
      expect(savedDb.lotteries.find((l: any) => l.year === 2023)).toBeUndefined();
      expect(savedDb.lotteries.find((l: any) => l.year === 2024)).toBeDefined();
      expect(savedDb.lotteries.find((l: any) => l.year === 2025)).toBeDefined();
    });

    it('should exit with error when lottery year not found', () => {
      const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      expect(() => deleteLotteryYear(2099, mockDbPath)).toThrow('process.exit called');
      expect(console.error).toHaveBeenCalledWith(
        '\n❌ Error: No lottery found for year 2099'
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should display available years when lottery not found', () => {
      const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      expect(() => deleteLotteryYear(2099, mockDbPath)).toThrow('process.exit called');

      expect(console.log).toHaveBeenCalledWith('\nAvailable years:');
      expect(console.log).toHaveBeenCalledWith('   - 2023');
      expect(console.log).toHaveBeenCalledWith('   - 2024');
      expect(console.log).toHaveBeenCalledWith('   - 2025');
    });

    it('should preserve config and other lotteries when deleting one', () => {
      deleteLotteryYear(2024, mockDbPath);

      const savedData = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      const savedDb = JSON.parse(savedData);

      // Config should remain unchanged
      expect(savedDb.config).toEqual(mockDatabase.config);

      // Should have 2 lotteries remaining
      expect(savedDb.lotteries).toHaveLength(2);
      expect(savedDb.lotteries.find((l: any) => l.year === 2023)).toBeDefined();
      expect(savedDb.lotteries.find((l: any) => l.year === 2025)).toBeDefined();
    });

    it('should handle deleting lottery with empty picks', () => {
      deleteLotteryYear(2025, mockDbPath);

      const savedData = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      const savedDb = JSON.parse(savedData);

      expect(savedDb.lotteries).toHaveLength(2);
      expect(savedDb.lotteries.find((l: any) => l.year === 2025)).toBeUndefined();
    });

    it('should handle deleting the only lottery', () => {
      const singleLotteryDb = {
        ...mockDatabase,
        lotteries: [mockDatabase.lotteries[0]],
      };
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(singleLotteryDb));

      deleteLotteryYear(2023, mockDbPath);

      const savedData = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      const savedDb = JSON.parse(savedData);

      expect(savedDb.lotteries).toHaveLength(0);
    });

    it('should log deletion details including picks count and date', () => {
      deleteLotteryYear(2023, mockDbPath);

      expect(console.log).toHaveBeenCalledWith('\n🗑️  Removed lottery for year 2023');
      expect(console.log).toHaveBeenCalledWith('   - 1 picks deleted');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('   - Date:')
      );
    });

    it('should log summary of remaining lotteries after deletion', () => {
      deleteLotteryYear(2023, mockDbPath);

      expect(console.log).toHaveBeenCalledWith(
        '\n✅ Successfully deleted lottery for year 2023'
      );
      expect(console.log).toHaveBeenCalledWith('📊 Remaining lotteries: 2');
      expect(console.log).toHaveBeenCalledWith('   - Year 2024');
      expect(console.log).toHaveBeenCalledWith('   - Year 2025');
    });
  });
});
