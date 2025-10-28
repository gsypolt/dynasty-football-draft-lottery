import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { DraftLottery, DraftConfig, DatabaseSchema } from '../../types';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    access: vi.fn(),
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    unlink: vi.fn(),
  },
}));

import fs from 'fs/promises';
import { Database } from '../database';

describe('[UNIT] Database - File Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create database directory and file when they do not exist', async () => {
    // Mock access to throw (file doesn't exist)
    vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    // This tests lines 38-40: database creation
    await Database.initialize();

    expect(fs.mkdir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('should not create database if it already exists', async () => {
    // Mock access to succeed (file exists)
    vi.mocked(fs.access).mockResolvedValue(undefined);

    await Database.initialize();

    expect(fs.mkdir).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });
});

describe('[UNIT] Database - Lottery Sorting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sort lotteries by year in descending order (most recent first)', async () => {
    // This tests lines 67-68: sorting logic
    const mockData: DatabaseSchema = {
      config: {
        numberOfTeams: 10,
        numberOfRounds: 5,
        teams: [],
        weightedSystem: [],
        pickDelaySeconds: 3,
        currentYear: 2025,
      },
      lotteries: [
        {
          id: 'lottery-2023',
          year: 2023,
          date: '2023-01-01',
          picks: [],
          config: {} as DraftConfig,
        },
        {
          id: 'lottery-2025',
          year: 2025,
          date: '2025-01-01',
          picks: [],
          config: {} as DraftConfig,
        },
        {
          id: 'lottery-2024',
          year: 2024,
          date: '2024-01-01',
          picks: [],
          config: {} as DraftConfig,
        },
      ],
    };

    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockData));

    const lotteries = await Database.getAllLotteries();

    // Verify sorting: most recent first
    expect(lotteries[0].year).toBe(2025);
    expect(lotteries[1].year).toBe(2024);
    expect(lotteries[2].year).toBe(2023);
  });

  it('should return empty array when no lotteries exist', async () => {
    const mockData: DatabaseSchema = {
      config: {
        numberOfTeams: 10,
        numberOfRounds: 5,
        teams: [],
        weightedSystem: [],
        pickDelaySeconds: 3,
        currentYear: 2025,
      },
      lotteries: [],
    };

    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockData));

    const lotteries = await Database.getAllLotteries();
    expect(lotteries).toEqual([]);
  });
});

describe('[UNIT] Database - Lottery Lookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should find lottery by year', async () => {
    // This tests lines 72-73: find method
    const mockLottery: DraftLottery = {
      id: 'lottery-2024',
      year: 2024,
      date: '2024-01-01',
      picks: [],
      config: {} as DraftConfig,
    };

    const mockData: DatabaseSchema = {
      config: {} as DraftConfig,
      lotteries: [mockLottery],
    };

    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockData));

    const lottery = await Database.getLotteryByYear(2024);

    expect(lottery).toBeDefined();
    expect(lottery?.year).toBe(2024);
    expect(lottery?.id).toBe('lottery-2024');
  });

  it('should return undefined when lottery not found', async () => {
    const mockData: DatabaseSchema = {
      config: {} as DraftConfig,
      lotteries: [],
    };

    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockData));

    const lottery = await Database.getLotteryByYear(2099);

    expect(lottery).toBeUndefined();
  });
});

describe('[UNIT] Database - Save Lottery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should replace existing lottery when saving same year', async () => {
    // This tests lines 77-85: filter and replace logic
    const existingLottery: DraftLottery = {
      id: 'lottery-2024',
      year: 2024,
      date: '2024-01-01',
      picks: [
        {
          round: 1,
          pickNumber: 1,
          teamId: 'team-1',
          originalPosition: 1,
          movement: 0,
        },
      ],
      config: {} as DraftConfig,
    };

    const newLottery: DraftLottery = {
      id: 'lottery-2024',
      year: 2024,
      date: '2024-06-01',
      picks: [
        {
          round: 1,
          pickNumber: 1,
          teamId: 'team-2',
          originalPosition: 2,
          movement: -1,
        },
        {
          round: 1,
          pickNumber: 2,
          teamId: 'team-1',
          originalPosition: 1,
          movement: 1,
        },
      ],
      config: {} as DraftConfig,
    };

    const mockData: DatabaseSchema = {
      config: {} as DraftConfig,
      lotteries: [existingLottery],
    };

    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockData));
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    await Database.saveLottery(newLottery);

    // Verify writeFile was called
    expect(fs.writeFile).toHaveBeenCalled();

    // Get the data that was written
    const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
    const writtenData = JSON.parse(writeCall[1] as string) as DatabaseSchema;

    // Should only have one lottery for 2024
    expect(writtenData.lotteries).toHaveLength(1);
    expect(writtenData.lotteries[0].picks).toHaveLength(2);
    expect(writtenData.lotteries[0].picks[0].teamId).toBe('team-2');
  });

  it('should add new lottery without removing others', async () => {
    const lottery2023: DraftLottery = {
      id: 'lottery-2023',
      year: 2023,
      date: '2023-01-01',
      picks: [],
      config: {} as DraftConfig,
    };

    const lottery2024: DraftLottery = {
      id: 'lottery-2024',
      year: 2024,
      date: '2024-01-01',
      picks: [],
      config: {} as DraftConfig,
    };

    const mockData: DatabaseSchema = {
      config: {} as DraftConfig,
      lotteries: [lottery2023],
    };

    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockData));
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    await Database.saveLottery(lottery2024);

    const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
    const writtenData = JSON.parse(writeCall[1] as string) as DatabaseSchema;

    expect(writtenData.lotteries).toHaveLength(2);
    expect(writtenData.lotteries.find((l) => l.year === 2023)).toBeDefined();
    expect(writtenData.lotteries.find((l) => l.year === 2024)).toBeDefined();
  });
});

describe('[UNIT] Database - Delete Lottery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete lottery by year', async () => {
    // This tests lines 89-91: deleteLottery method
    const lottery2023: DraftLottery = {
      id: 'lottery-2023',
      year: 2023,
      date: '2023-01-01',
      picks: [],
      config: {} as DraftConfig,
    };

    const lottery2024: DraftLottery = {
      id: 'lottery-2024',
      year: 2024,
      date: '2024-01-01',
      picks: [],
      config: {} as DraftConfig,
    };

    const mockData: DatabaseSchema = {
      config: {} as DraftConfig,
      lotteries: [lottery2023, lottery2024],
    };

    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockData));
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    await Database.deleteLottery(2024);

    const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
    const writtenData = JSON.parse(writeCall[1] as string) as DatabaseSchema;

    expect(writtenData.lotteries).toHaveLength(1);
    expect(writtenData.lotteries[0].year).toBe(2023);
  });

  it('should not throw error when deleting non-existent lottery', async () => {
    const mockData: DatabaseSchema = {
      config: {} as DraftConfig,
      lotteries: [],
    };

    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockData));
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    await expect(Database.deleteLottery(2099)).resolves.not.toThrow();
  });

  it('should handle deleting all lotteries', async () => {
    const lottery2024: DraftLottery = {
      id: 'lottery-2024',
      year: 2024,
      date: '2024-01-01',
      picks: [],
      config: {} as DraftConfig,
    };

    const mockData: DatabaseSchema = {
      config: {} as DraftConfig,
      lotteries: [lottery2024],
    };

    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockData));
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    await Database.deleteLottery(2024);

    const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
    const writtenData = JSON.parse(writeCall[1] as string) as DatabaseSchema;

    expect(writtenData.lotteries).toEqual([]);
  });
});

describe('[UNIT] Database - Initialize Method', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call ensureDbExists when initializing', async () => {
    // This tests lines 96-97: initialize method
    vi.mocked(fs.access).mockResolvedValue(undefined);

    await Database.initialize();

    expect(fs.access).toHaveBeenCalled();
  });

  it('should create database when initializing if not exists', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('Not found'));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    await Database.initialize();

    expect(fs.mkdir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });
});

describe('[UNIT] Database - Config Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get config successfully', async () => {
    const mockConfig: DraftConfig = {
      numberOfTeams: 10,
      numberOfRounds: 5,
      teams: [],
      weightedSystem: [
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
      ],
      pickDelaySeconds: 3,
      currentYear: 2025,
    };

    const mockData: DatabaseSchema = {
      config: mockConfig,
      lotteries: [],
    };

    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockData));

    const config = await Database.getConfig();

    expect(config.numberOfTeams).toBe(10);
    expect(config.numberOfRounds).toBe(5);
    expect(config.weightedSystem).toHaveLength(10);
  });

  it('should update config successfully', async () => {
    const oldConfig: DraftConfig = {
      numberOfTeams: 10,
      numberOfRounds: 5,
      teams: [],
      weightedSystem: [],
      pickDelaySeconds: 3,
      currentYear: 2025,
    };

    const newConfig: DraftConfig = {
      numberOfTeams: 10,
      numberOfRounds: 3,
      teams: [
        {
          id: 'team-1',
          name: 'Test Team',
          logoUrl: 'https://example.com/logo.png',
          logoType: 'url',
        },
      ],
      weightedSystem: [],
      pickDelaySeconds: 5,
      currentYear: 2025,
    };

    const mockData: DatabaseSchema = {
      config: oldConfig,
      lotteries: [],
    };

    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockData));
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    await Database.updateConfig(newConfig);

    const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
    const writtenData = JSON.parse(writeCall[1] as string) as DatabaseSchema;

    expect(writtenData.config.numberOfRounds).toBe(3);
    expect(writtenData.config.pickDelaySeconds).toBe(5);
    expect(writtenData.config.teams).toHaveLength(1);
  });
});
