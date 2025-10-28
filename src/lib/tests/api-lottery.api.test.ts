import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../../pages/api/lottery/[year]';
import { Database } from '../database';

// Mock the Database module
vi.mock('../database', () => ({
  Database: {
    getLotteryByYear: vi.fn(),
  },
}));

describe('[API] GET /api/lottery/[year]', () => {
  const mockLottery = {
    id: 'lottery-2024',
    year: 2024,
    date: '2024-06-15T23:00:00.000Z',
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
      currentYear: 2024,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return lottery data for valid year', async () => {
    // Mock successful database response
    vi.mocked(Database.getLotteryByYear).mockResolvedValue(mockLottery);

    const response = await GET({
      params: { year: '2024' },
    } as any);

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(data).toEqual(mockLottery);
    expect(Database.getLotteryByYear).toHaveBeenCalledWith(2024);
  });

  it('should return 400 for invalid year format', async () => {
    const response = await GET({
      params: { year: 'invalid' },
    } as any);

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid year' });
    expect(Database.getLotteryByYear).not.toHaveBeenCalled();
  });

  it('should return 400 for missing year', async () => {
    const response = await GET({
      params: {},
    } as any);

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid year' });
    expect(Database.getLotteryByYear).not.toHaveBeenCalled();
  });

  it('should return 404 when lottery not found', async () => {
    // Mock database returning undefined (lottery not found)
    vi.mocked(Database.getLotteryByYear).mockResolvedValue(undefined);

    const response = await GET({
      params: { year: '2099' },
    } as any);

    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Lottery not found' });
    expect(Database.getLotteryByYear).toHaveBeenCalledWith(2099);
  });

  it('should return 500 when database throws error', async () => {
    // Mock database throwing an error
    vi.mocked(Database.getLotteryByYear).mockRejectedValue(new Error('Database error'));

    const response = await GET({
      params: { year: '2024' },
    } as any);

    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch lottery' });
  });

  it('should handle year with leading zeros', async () => {
    vi.mocked(Database.getLotteryByYear).mockResolvedValue(mockLottery);

    const response = await GET({
      params: { year: '0002024' },
    } as any);

    expect(response.status).toBe(200);
    expect(Database.getLotteryByYear).toHaveBeenCalledWith(2024);
  });

  it('should return correct content-type header', async () => {
    vi.mocked(Database.getLotteryByYear).mockResolvedValue(mockLottery);

    const response = await GET({
      params: { year: '2024' },
    } as any);

    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('should handle negative years', async () => {
    // Mock database returning undefined for negative year
    vi.mocked(Database.getLotteryByYear).mockResolvedValue(undefined);

    const response = await GET({
      params: { year: '-2024' },
    } as any);

    const data = await response.json();

    // Note: parseInt('-2024') returns -2024, which is a valid number
    // The API accepts it and queries the database
    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Lottery not found' });
    expect(Database.getLotteryByYear).toHaveBeenCalledWith(-2024);
  });
});
