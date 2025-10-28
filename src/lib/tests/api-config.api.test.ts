import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '../../pages/api/config';
import { Database } from '../database';
import type { DraftConfig } from '../../types';

// Mock the Database module
vi.mock('../database', () => ({
  Database: {
    getConfig: vi.fn(),
    updateConfig: vi.fn(),
  },
}));

describe('[API] GET /api/config', () => {
  const mockConfig: DraftConfig = {
    numberOfTeams: 10,
    numberOfRounds: 5,
    teams: [
      {
        id: 'team-1',
        name: 'Team 1',
        logoUrl: 'https://example.com/logo1.png',
        logoType: 'url',
      },
      {
        id: 'team-2',
        name: 'Team 2',
        logoUrl: 'https://example.com/logo2.png',
        logoType: 'url',
      },
    ],
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return config successfully', async () => {
    vi.mocked(Database.getConfig).mockResolvedValue(mockConfig);

    const response = await GET({} as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(data).toEqual(mockConfig);
    expect(Database.getConfig).toHaveBeenCalledTimes(1);
  });

  it('should return 500 when database throws error', async () => {
    vi.mocked(Database.getConfig).mockRejectedValue(new Error('Database error'));

    const response = await GET({} as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch config' });
  });

  it('should have correct content-type header', async () => {
    vi.mocked(Database.getConfig).mockResolvedValue(mockConfig);

    const response = await GET({} as any);

    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('should return config with all teams', async () => {
    vi.mocked(Database.getConfig).mockResolvedValue(mockConfig);

    const response = await GET({} as any);
    const data = await response.json();

    expect(data.teams).toHaveLength(2);
    expect(data.teams[0]).toHaveProperty('id');
    expect(data.teams[0]).toHaveProperty('name');
    expect(data.teams[0]).toHaveProperty('logoUrl');
    expect(data.teams[0]).toHaveProperty('logoType');
  });

  it('should return config with weighted system', async () => {
    vi.mocked(Database.getConfig).mockResolvedValue(mockConfig);

    const response = await GET({} as any);
    const data = await response.json();

    expect(data.weightedSystem).toHaveLength(10);
    expect(data.weightedSystem[0]).toHaveProperty('position');
    expect(data.weightedSystem[0]).toHaveProperty('percentage');
  });
});

describe('[API] POST /api/config', () => {
  const updatedConfig: DraftConfig = {
    numberOfTeams: 10,
    numberOfRounds: 3,
    teams: [
      {
        id: 'team-1',
        name: 'Updated Team 1',
        logoUrl: 'https://example.com/new-logo1.png',
        logoType: 'url',
      },
    ],
    weightedSystem: [
      { position: 10, percentage: 30.0 },
      { position: 9, percentage: 20.0 },
      { position: 8, percentage: 15.0 },
      { position: 7, percentage: 10.0 },
      { position: 6, percentage: 8.0 },
      { position: 5, percentage: 5.0 },
      { position: 4, percentage: 4.0 },
      { position: 3, percentage: 3.0 },
      { position: 2, percentage: 3.0 },
      { position: 1, percentage: 2.0 },
    ],
    pickDelaySeconds: 5,
    currentYear: 2025,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update config successfully', async () => {
    vi.mocked(Database.updateConfig).mockResolvedValue(undefined);

    const mockRequest = {
      json: vi.fn().mockResolvedValue(updatedConfig),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(data).toEqual({ success: true });
    expect(Database.updateConfig).toHaveBeenCalledWith(updatedConfig);
    expect(mockRequest.json).toHaveBeenCalledTimes(1);
  });

  it('should return 500 when database update fails', async () => {
    vi.mocked(Database.updateConfig).mockRejectedValue(new Error('Update failed'));

    const mockRequest = {
      json: vi.fn().mockResolvedValue(updatedConfig),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to update config' });
  });

  it('should return 500 when request JSON parsing fails', async () => {
    const mockRequest = {
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to update config' });
    expect(Database.updateConfig).not.toHaveBeenCalled();
  });

  it('should handle config with different number of rounds', async () => {
    vi.mocked(Database.updateConfig).mockResolvedValue(undefined);

    const configWithOneRound = { ...updatedConfig, numberOfRounds: 1 };
    const mockRequest = {
      json: vi.fn().mockResolvedValue(configWithOneRound),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(Database.updateConfig).toHaveBeenCalledWith(configWithOneRound);
  });

  it('should handle config with different pick delay', async () => {
    vi.mocked(Database.updateConfig).mockResolvedValue(undefined);

    const configWithLongerDelay = { ...updatedConfig, pickDelaySeconds: 10 };
    const mockRequest = {
      json: vi.fn().mockResolvedValue(configWithLongerDelay),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Database.updateConfig).toHaveBeenCalledWith(configWithLongerDelay);
  });

  it('should handle config with initial order', async () => {
    vi.mocked(Database.updateConfig).mockResolvedValue(undefined);

    const configWithInitialOrder = {
      ...updatedConfig,
      initialOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };
    const mockRequest = {
      json: vi.fn().mockResolvedValue(configWithInitialOrder),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Database.updateConfig).toHaveBeenCalledWith(configWithInitialOrder);
  });

  it('should have correct content-type header on success', async () => {
    vi.mocked(Database.updateConfig).mockResolvedValue(undefined);

    const mockRequest = {
      json: vi.fn().mockResolvedValue(updatedConfig),
    };

    const response = await POST({ request: mockRequest } as any);

    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('should have correct content-type header on error', async () => {
    vi.mocked(Database.updateConfig).mockRejectedValue(new Error('Error'));

    const mockRequest = {
      json: vi.fn().mockResolvedValue(updatedConfig),
    };

    const response = await POST({ request: mockRequest } as any);

    expect(response.headers.get('Content-Type')).toBe('application/json');
  });
});
