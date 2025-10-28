# Scripts

This directory contains utility scripts for managing the Dynasty Football Draft Lottery application.

## Available Scripts

### Seed History Data
**File:** `seed-history.ts`
**Command:** `npm run seed`

Populates the database with sample lottery data for 3 years (2023, 2024, 2025).

**Usage:**
```bash
npm run seed
```

**What it does:**
- Creates sample lottery results for 3 years
- Generates realistic pick movements
- Sets up team configurations with logos
- Useful for testing and demonstration

---

### Delete Lottery Year
**File:** `delete-lottery-year.ts`
**Command:** `npm run delete-year <year>`

Removes a specific lottery year from the database while preserving the configuration.

**Usage:**
```bash
npm run delete-year 2023
```

**Arguments:**
- `<year>` - The year to delete (e.g., 2023, 2024, 2025)

**What it does:**
- ✅ Removes all lottery results for the specified year
- ✅ Keeps team configuration intact
- ✅ Preserves weighted odds and settings
- ✅ Maintains all other lottery years
- ✅ Saves the updated database automatically

**Example output:**
```
🔍 Loading database...
📊 Current lotteries: 3
   - Year 2023 (50 picks)
   - Year 2024 (50 picks)
   - Year 2025 (20 picks)

🗑️  Removed lottery for year 2023
   - 50 picks deleted
   - Date: 6/15/2023

✅ Successfully deleted lottery for year 2023
📊 Remaining lotteries: 2
   - Year 2024
   - Year 2025

✨ Config and teams remain unchanged
```

---

## Creating New Scripts

All scripts should:
1. Use TypeScript (`.ts` extension)
2. Include proper error handling
3. Provide clear console output
4. Be executable via npm commands
5. Include usage documentation in comments

**Template:**
```typescript
#!/usr/bin/env tsx

/**
 * Script description
 * Usage: npm run <command> <args>
 * Example: npm run <command> example-arg
 */

// Your script code here
```

Add the script command to `package.json`:
```json
{
  "scripts": {
    "your-command": "tsx scripts/your-script.ts"
  }
}
```
