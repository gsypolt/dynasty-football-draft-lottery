#!/usr/bin/env tsx

/**
 * Script to reset the database with default configuration
 * Usage: npm run reset-db
 *
 * This is useful after running tests which may have created a database
 * with test data instead of your actual team configuration.
 */

import { Database } from '../src/lib/database';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'database.json');

async function resetDatabase() {
  console.log('🔄 Resetting database...\n');

  try {
    // Check if database exists
    try {
      await fs.access(DB_PATH);
      console.log('📁 Found existing database.json');

      // Delete the existing database
      await fs.unlink(DB_PATH);
      console.log('🗑️  Deleted existing database');
    } catch {
      console.log('📁 No existing database found');
    }

    // Initialize with default configuration
    console.log('\n💾 Creating database with default configuration...');
    await Database.initialize();

    console.log('✅ Database reset successfully!');
    console.log('\n📊 Default configuration includes:');
    console.log('   - 10 teams with logos');
    console.log('   - 5 rounds');
    console.log('   - Weighted odds system');
    console.log('\n🚀 You can now run the application with: npm run dev');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

// Run the reset function
resetDatabase();
