import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '../../pages/api/lottery';
import { Database } from '../database';

// Mock the Database module
vi.mock('../database', () => ({
  Database: {
    getAllLotteries: vi.fn(),
    saveLottery: vi.fn(),
  },
}));

describe('[API] GET /api/lottery', () => {
  const mockLotteries = [
    {
      id: 'lottery-2024',
      year: 2024,
      date: '2024-06-15T23:00:00.000Z',
      picks: [],
      config: {},
    },
    {
      id: 'lottery-2023',
      year: 2023,
      date: '2023-06-15T23:00:00.000Z',
      picks: [],
      config: {},
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all lotteries', async () => {
    vi.mocked(Database.getAllLotteries).mockResolvedValue(mockLotteries);

    const response = await GET({} as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(data).toEqual(mockLotteries);
    expect(Database.getAllLotteries).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no lotteries exist', async () => {
    vi.mocked(Database.getAllLotteries).mockResolvedValue([]);

    const response = await GET({} as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it('should return 500 when database throws error', async () => {
    vi.mocked(Database.getAllLotteries).mockRejectedValue(new Error('Database error'));

    const response = await GET({} as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch lotteries' });
  });

  it('should have correct content-type header', async () => {
    vi.mocked(Database.getAllLotteries).mockResolvedValue(mockLotteries);

    const response = await GET({} as any);

    expect(response.headers.get('Content-Type')).toBe('application/json');
  });
});

describe('[API] POST /api/lottery', () => {
  const mockLottery = {
    id: 'lottery-2025',
    year: 2025,
    date: new Date().toISOString(),
    picks: [
      {
        round: 1,
        pickNumber: 1,
        teamId: 'team-1',
        originalPosition: 1,
        movement: 0,
      },
    ],
    config: {
      numberOfTeams: 10,
      numberOfRounds: 5,
      teams: [],
      weightedSystem: [],
      pickDelaySeconds: 3,
      currentYear: 2025,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save lottery successfully', async () => {
    vi.mocked(Database.saveLottery).mockResolvedValue(undefined);

    const mockRequest = {
      json: vi.fn().mockResolvedValue(mockLottery),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(data).toEqual({ success: true });
    expect(Database.saveLottery).toHaveBeenCalledWith(mockLottery);
    expect(mockRequest.json).toHaveBeenCalledTimes(1);
  });

  it('should return 500 when database save fails', async () => {
    vi.mocked(Database.saveLottery).mockRejectedValue(new Error('Save failed'));

    const mockRequest = {
      json: vi.fn().mockResolvedValue(mockLottery),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to save lottery' });
  });

  it('should return 500 when request JSON parsing fails', async () => {
    const mockRequest = {
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to save lottery' });
    expect(Database.saveLottery).not.toHaveBeenCalled();
  });

  it('should handle empty picks array', async () => {
    vi.mocked(Database.saveLottery).mockResolvedValue(undefined);

    const lotteryWithNoPicks = { ...mockLottery, picks: [] };
    const mockRequest = {
      json: vi.fn().mockResolvedValue(lotteryWithNoPicks),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(Database.saveLottery).toHaveBeenCalledWith(lotteryWithNoPicks);
  });

  it('should have correct content-type header on success', async () => {
    vi.mocked(Database.saveLottery).mockResolvedValue(undefined);

    const mockRequest = {
      json: vi.fn().mockResolvedValue(mockLottery),
    };

    const response = await POST({ request: mockRequest } as any);

    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('should have correct content-type header on error', async () => {
    vi.mocked(Database.saveLottery).mockRejectedValue(new Error('Error'));

    const mockRequest = {
      json: vi.fn().mockResolvedValue(mockLottery),
    };

    const response = await POST({ request: mockRequest } as any);

    expect(response.headers.get('Content-Type')).toBe('application/json');
  });
});
