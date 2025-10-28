import type { DatabaseSchema, DraftConfig, DraftLottery } from '../types';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'database.json');

const defaultConfig: DraftConfig = {
  numberOfTeams: 10,
  numberOfRounds: 5,
  teams: [
    { id: 'team-1', name: 'Knockout Kings', logoUrl: 'https://www47.myfantasyleague.com/fflnetdynamic2024/58890_franchise_icon0001.png', logoType: 'url' },
    { id: 'team-2', name: 'Operation BlackRhino', logoUrl: 'https://www47.myfantasyleague.com/fflnetdynamic2024/58890_franchise_icon0002.jpg', logoType: 'url' },
    { id: 'team-3', name: 'Loco Lobos', logoUrl: 'https://www47.myfantasyleague.com/fflnetdynamic2024/58890_franchise_icon0003.png', logoType: 'url' },
    { id: 'team-4', name: 'Buck Hunters', logoUrl: 'https://www47.myfantasyleague.com/fflnetdynamic2023/58890_franchise_icon0004.jpg', logoType: 'url' },
    { id: 'team-5', name: 'Chieftains', logoUrl: 'https://www47.myfantasyleague.com/fflnetdynamic2024/58890_franchise_icon0005.png', logoType: 'url' },
    { id: 'team-6', name: 'Redskin Nation', logoUrl: 'https://www47.myfantasyleague.com/fflnetdynamic2022/72440_franchise_icon0006.png', logoType: 'url' },
    { id: 'team-7', name: 'Whiskey Warriors', logoUrl: 'https://www47.myfantasyleague.com/fflnetdynamic2022/72440_franchise_icon0007.png', logoType: 'url' },
    { id: 'team-8', name: 'Gorilla Warefare Klan', logoUrl: 'https://www47.myfantasyleague.com/fflnetdynamic2022/72440_franchise_icon0008.png', logoType: 'url' },
    { id: 'team-9', name: 'Evil Engineers', logoUrl: 'https://www47.myfantasyleague.com/fflnetdynamic2022/72440_franchise_icon0009.jpg', logoType: 'url' },
    { id: 'team-10', name: 'Guardians', logoUrl: 'https://www47.myfantasyleague.com/fflnetdynamic2024/58890_franchise_icon0010.png', logoType: 'url' },
  ],
  weightedSystem: [
    { position: 10, percentage: 25.0 }, // Worst team: 25%
    { position: 9, percentage: 18.8 },
    { position: 8, percentage: 14.1 },
    { position: 7, percentage: 10.5 },
    { position: 6, percentage: 7.9 },
    { position: 5, percentage: 6.2 },
    { position: 4, percentage: 6.2 },
    { position: 3, percentage: 4.7 },
    { position: 2, percentage: 3.5 },
    { position: 1, percentage: 3.1 }, // Champion: 3.1%
  ],
  pickDelaySeconds: 3,
  currentYear: new Date().getFullYear(),
};

const defaultDatabase: DatabaseSchema = {
  config: defaultConfig,
  lotteries: [],
};

export class Database {
  private static async ensureDbExists(): Promise<void> {
    try {
      await fs.access(DB_PATH);
    } catch {
      // Database doesn't exist, create it
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      await fs.writeFile(DB_PATH, JSON.stringify(defaultDatabase, null, 2));
    }
  }

  private static async read(): Promise<DatabaseSchema> {
    await this.ensureDbExists();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  }

  private static async write(data: DatabaseSchema): Promise<void> {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  }

  // Config methods
  static async getConfig(): Promise<DraftConfig> {
    const db = await this.read();
    return db.config;
  }

  static async updateConfig(config: DraftConfig): Promise<void> {
    const db = await this.read();
    db.config = config;
    await this.write(db);
  }

  // Lottery methods
  static async getAllLotteries(): Promise<DraftLottery[]> {
    const db = await this.read();
    return db.lotteries.sort((a, b) => b.year - a.year); // Most recent first
  }

  static async getLotteryByYear(year: number): Promise<DraftLottery | undefined> {
    const db = await this.read();
    return db.lotteries.find((lottery) => lottery.year === year);
  }

  static async saveLottery(lottery: DraftLottery): Promise<void> {
    const db = await this.read();

    // Remove existing lottery for the same year if exists
    db.lotteries = db.lotteries.filter((l) => l.year !== lottery.year);

    // Add new lottery
    db.lotteries.push(lottery);

    await this.write(db);
  }

  static async deleteLottery(year: number): Promise<void> {
    const db = await this.read();
    db.lotteries = db.lotteries.filter((l) => l.year !== year);
    await this.write(db);
  }

  // Initialize database with default values
  static async initialize(): Promise<void> {
    await this.ensureDbExists();
  }
}
