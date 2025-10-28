/**
 * Seed script to populate the database with sample lottery data for testing
 * Run with: npx tsx scripts/seed-history.ts
 */

import { Database } from '../src/lib/database';
import { runCompleteLottery } from '../src/lib/lottery';
import type { DraftConfig } from '../src/types';

async function seedHistory() {
  console.log('🌱 Seeding lottery history...\n');

  // Get current config
  const config = await Database.getConfig();

  // Ensure we have teams configured
  if (config.teams.length === 0) {
    console.log('Setting up default teams...');
    config.teams = [
      { id: 'team-1', name: 'Thunderbolts', logoUrl: 'https://via.placeholder.com/100/FF6B6B/FFFFFF?text=TB', logoType: 'url' },
      { id: 'team-2', name: 'Storm Chasers', logoUrl: 'https://via.placeholder.com/100/4ECDC4/FFFFFF?text=SC', logoType: 'url' },
      { id: 'team-3', name: 'Iron Giants', logoUrl: 'https://via.placeholder.com/100/45B7D1/FFFFFF?text=IG', logoType: 'url' },
      { id: 'team-4', name: 'Phoenix Rising', logoUrl: 'https://via.placeholder.com/100/F7DC6F/FFFFFF?text=PR', logoType: 'url' },
      { id: 'team-5', name: 'Midnight Wolves', logoUrl: 'https://via.placeholder.com/100/BB8FCE/FFFFFF?text=MW', logoType: 'url' },
      { id: 'team-6', name: 'Golden Eagles', logoUrl: 'https://via.placeholder.com/100/F8B739/FFFFFF?text=GE', logoType: 'url' },
      { id: 'team-7', name: 'Silver Sharks', logoUrl: 'https://via.placeholder.com/100/85C1E2/FFFFFF?text=SS', logoType: 'url' },
      { id: 'team-8', name: 'Crimson Tide', logoUrl: 'https://via.placeholder.com/100/E74C3C/FFFFFF?text=CT', logoType: 'url' },
      { id: 'team-9', name: 'Emerald Knights', logoUrl: 'https://via.placeholder.com/100/27AE60/FFFFFF?text=EK', logoType: 'url' },
      { id: 'team-10', name: 'Dynasty Dragons', logoUrl: 'https://via.placeholder.com/100/8E44AD/FFFFFF?text=DD', logoType: 'url' },
    ];
    await Database.updateConfig(config);
  }

  // Generate lotteries for the past 3 years
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear];

  for (const year of years) {
    console.log(`📅 Generating lottery for ${year}...`);

    // Randomize the initial order for each year to simulate different seasons
    const initialOrder = Array.from({ length: 10 }, (_, i) => i + 1);

    // Shuffle for variety (except first year which uses standard order)
    if (year !== years[0]) {
      for (let i = initialOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [initialOrder[i], initialOrder[j]] = [initialOrder[j], initialOrder[i]];
      }
    }

    // Run the lottery
    const picks = runCompleteLottery(config, initialOrder);

    // Create lottery record
    const lottery = {
      id: `lottery-${year}`,
      year: year,
      date: new Date(year, 5, 15, 19, 0, 0).toISOString(), // June 15 at 7 PM
      picks: picks,
      config: { ...config },
    };

    // Save to database
    await Database.saveLottery(lottery);

    console.log(`  ✅ Saved lottery for ${year}`);
    console.log(`  📊 Total picks: ${picks.length}`);
    console.log(`  🔄 Movement stats:`);

    // Calculate movement stats
    const movements = picks.reduce((acc, pick) => {
      if (pick.movement < 0) acc.up++;
      else if (pick.movement > 0) acc.down++;
      else acc.stayed++;
      return acc;
    }, { up: 0, down: 0, stayed: 0 });

    console.log(`     - Moved up: ${movements.up}`);
    console.log(`     - Moved down: ${movements.down}`);
    console.log(`     - Stayed: ${movements.stayed}`);
    console.log();
  }

  console.log('✨ Seeding complete!');
  console.log(`\n📍 View history at: http://localhost:4321/history`);
}

// Run the seed function
seedHistory().catch((error) => {
  console.error('❌ Error seeding history:', error);
  process.exit(1);
});
