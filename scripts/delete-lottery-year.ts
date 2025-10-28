#!/usr/bin/env tsx

/**
 * Script to delete a specific lottery year from the database
 * Usage: npm run delete-year <year>
 * Example: npm run delete-year 2023
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'src', 'data', 'database.json');

interface Database {
  config: any;
  lotteries: Array<{
    id: string;
    year: number;
    date: string;
    picks: any[];
    config: any;
  }>;
}

export function loadDatabase(dbPath: string = DB_PATH): Database {
  if (!existsSync(dbPath)) {
    console.error('❌ Error: database.json not found at', dbPath);
    process.exit(1);
  }

  try {
    const data = readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error: Failed to parse database.json', error);
    process.exit(1);
  }
}

export function saveDatabase(db: Database, dbPath: string = DB_PATH): void {
  try {
    writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    console.log('✅ Database saved successfully');
  } catch (error) {
    console.error('❌ Error: Failed to save database.json', error);
    process.exit(1);
  }
}

export function deleteLotteryYear(year: number, dbPath: string = DB_PATH): void {
  console.log(`\n🔍 Loading database from ${dbPath}...`);
  const db = loadDatabase(dbPath);

  console.log(`📊 Current lotteries: ${db.lotteries.length}`);
  db.lotteries.forEach((lottery) => {
    console.log(`   - Year ${lottery.year} (${lottery.picks.length} picks)`);
  });

  // Find the lottery for the specified year
  const lotteryIndex = db.lotteries.findIndex((lottery) => lottery.year === year);

  if (lotteryIndex === -1) {
    console.error(`\n❌ Error: No lottery found for year ${year}`);
    console.log('\nAvailable years:');
    db.lotteries.forEach((lottery) => {
      console.log(`   - ${lottery.year}`);
    });
    process.exit(1);
  }

  // Remove the lottery
  const removedLottery = db.lotteries.splice(lotteryIndex, 1)[0];
  console.log(`\n🗑️  Removed lottery for year ${year}`);
  console.log(`   - ${removedLottery.picks.length} picks deleted`);
  console.log(`   - Date: ${new Date(removedLottery.date).toLocaleDateString()}`);

  // Save the updated database
  console.log(`\n💾 Saving updated database...`);
  saveDatabase(db, dbPath);

  console.log(`\n✅ Successfully deleted lottery for year ${year}`);
  console.log(`📊 Remaining lotteries: ${db.lotteries.length}`);
  db.lotteries.forEach((lottery) => {
    console.log(`   - Year ${lottery.year}`);
  });

  console.log('\n✨ Config and teams remain unchanged');
}

// Main execution - only run if this file is executed directly
if (require.main === module) {
  const year = parseInt(process.argv[2]);

  if (!year || isNaN(year)) {
    console.error('❌ Error: Please provide a valid year');
    console.log('\nUsage: npm run delete-year <year>');
    console.log('Example: npm run delete-year 2023');
    process.exit(1);
  }

  deleteLotteryYear(year);
}
