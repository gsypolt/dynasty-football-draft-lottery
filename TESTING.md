# Testing Guide

This guide will help you test all features of the Dynasty Football Draft Lottery application.

## Setup

1. **Install dependencies** (if not already done):
```bash
npm install
```

2. **Seed test data** for multiple years:
```bash
npm run seed
```

This will create lottery data for 2023, 2024, and 2025 with sample teams.

3. **Start the development server**:
```bash
npm run dev
```

The server will start at `http://localhost:4321` (or the next available port).

## Testing the Configuration Page

**URL**: `http://localhost:4321/config`

### What to Test:

1. **League Settings**
   - ✅ Verify "Number of Teams" is fixed at 10
   - ✅ Change "Number of Rounds" (try 1, 3, 5, 10)
   - ✅ Adjust "Pick Delay" for simulations (try 1, 3, 5 seconds)

2. **Team Configuration**
   - ✅ Edit team names
   - ✅ Add logo URLs (or use the sample placeholder URLs)
   - ✅ Toggle between "URL" and "Upload" logo types

3. **Weighted Odds System**
   - ✅ Modify percentages for each position
   - ✅ Verify the total displays as you type
   - ✅ Try to save with total ≠ 100% (should show error)
   - ✅ Ensure total = 100% and save successfully

4. **Save Configuration**
   - ✅ Click "Save Configuration"
   - ✅ Verify success notification appears
   - ✅ Refresh page and confirm settings persisted

## Testing the Live Lottery Page

**URL**: `http://localhost:4321/` (default home page)

### What to Test:

1. **Initial Order Setup**
   - ✅ Verify teams are listed in order (Position 10 = Worst Team)
   - ✅ Drag and drop teams to reorder them
   - ✅ Verify position numbers update correctly
   - ✅ Click "Start Lottery"

2. **Manual Pick Reveals**
   - ✅ Click "Reveal Next Pick"
   - ✅ Watch card flip animation
   - ✅ Verify team logo/name appears
   - ✅ Check movement indicator (↑ moved up, ↓ moved down, or "Stayed")
   - ✅ Verify movement is within 2 spots (max ±2)
   - ✅ Continue revealing picks one by one

3. **Simulated Pick Reveals**
   - ✅ Click "Simulate Remaining Picks"
   - ✅ Watch automated reveals with delays
   - ✅ Verify picks are revealed at the configured delay interval
   - ✅ Buttons should be disabled during simulation

4. **Multi-Round Progression**
   - ✅ Complete Round 1
   - ✅ Verify Round 2 starts automatically after a delay
   - ✅ Continue through all configured rounds
   - ✅ Watch for "Save Lottery Results" button after final round

5. **Saving Results**
   - ✅ Click "Save Lottery Results"
   - ✅ Verify success message
   - ✅ Should redirect to History page

## Testing the History Page

**URL**: `http://localhost:4321/history`

### What to Test:

1. **Year Navigation**
   - ✅ Verify left sidebar shows all years (2023, 2024, 2025)
   - ✅ Each year shows date it was conducted
   - ✅ Click different years
   - ✅ Verify active year is highlighted

2. **Lottery Results Display**
   - ✅ Verify results load for selected year
   - ✅ Check that rounds are displayed separately
   - ✅ Each pick shows:
     - Pick number
     - Team logo (or initials if no logo)
     - Team name
     - Original position
     - Movement indicator with color:
       - 🟢 Green = moved up
       - 🔴 Red = moved down
       - ⚪ Gray = stayed

3. **Multiple Years**
   - ✅ Switch between years
   - ✅ Verify different results for each year
   - ✅ Confirm each year has 5 rounds (default config)
   - ✅ Check that movement stats vary by year

4. **Empty State**
   - ✅ Delete database.json (optional test)
   - ✅ Verify "No draft lotteries" message appears
   - ✅ Click "Run Your First Lottery" button
   - ✅ Should navigate to home page (lottery)

## Testing the Lottery Algorithm

### Running Tests

**Run All Tests (with UI)**:
```bash
npm test
```

**Run Specific Test Categories**:
```bash
# Run only unit tests
npm run test:unit

# Run only UI tests
npm run test:ui

# Run only API tests (when available)
npm run test:api
```

**Run Tests in Terminal (no UI)**:
```bash
npm run test:headless
```

### Code Coverage

**Run Tests with Coverage**:
```bash
# Generate coverage report in terminal
npm run test:coverage

# View coverage in Vitest UI
npm run test:coverage:ui
```

**Understanding Coverage Reports**:
- After running coverage, open `coverage/index.html` in a browser
- Green lines = covered by tests
- Red lines = not covered (quality gaps)
- Yellow lines = partially covered (some branches missing)

**Current Coverage Status**:
```
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------------
All files          |   94.71 |    95.83 |     100 |   94.71 | 🎉 Excellent!
 scripts           |   85.93 |    92.85 |     100 |   85.93 |
  delete-lottery   |   85.93 |    92.85 |     100 |   85.93 | 92-102 (main exec)
 lib               |   94.57 |    95.08 |     100 |   94.57 |
  database.ts      |     100 |      100 |     100 |     100 | ✅ Perfect!
  lottery.ts       |   91.78 |    93.33 |     100 |   91.78 | (see gaps below)
 pages/api         |     100 |      100 |     100 |     100 | ✅ Perfect!
  config.ts        |     100 |      100 |     100 |     100 |
  lottery.ts       |     100 |      100 |     100 |     100 |
 pages/api/lottery |     100 |      100 |     100 |     100 | ✅ Perfect!
  [year].ts        |     100 |      100 |     100 |     100 |
```

**Coverage Achievements**:
- ✅ **database.ts**: Improved from 73% to **100%** coverage!
- ✅ **lottery.ts**: Improved from 90.41% to **91.78%** coverage!
- ✅ **delete-lottery-year.ts**: **85.93%** coverage (NEW! ⭐)
- ✅ **All API endpoints**: **100%** coverage
- ✅ **Overall project**: **94.71%** coverage (exceeds 90% threshold)
- ✅ **All functions**: **100%** coverage

**Remaining Minor Gaps (lottery.ts - 91.78%)**:

These uncovered lines represent **defensive fallback code** that's designed to never execute in normal operation:

1. **Lines 113-114**: `weightedRandomSelection` fallback return
   - Fallback when weighted random selection loop fails to select a position
   - Mathematically impossible with normalized probabilities that sum to 1.0
   - Defensive code for theoretical edge case

2. **Lines 195-202**: `runLotteryRound` MAX_ATTEMPTS fallback
   - Returns no-movement picks after 1,000 failed lottery generation attempts
   - Constraint-satisfaction algorithm is designed to always succeed within a few attempts
   - Provides graceful degradation for theoretically impossible scenarios

3. **Lines 222-223**: `runCompleteLottery` validation error throw
   - Validates that `runLotteryRound` produced valid picks
   - Since `runLotteryRound` is designed to always produce valid picks, this error never triggers
   - Defensive check to ensure algorithm correctness

**Uncovered Lines in delete-lottery-year.ts (85.93%)**:

**Lines 92-102**: Main execution block
- Only runs when script is executed directly from command line
- Not executed during unit test imports
- Tested manually via: `npm run delete-year <year>`

**Why These Are Acceptable**:
- lottery.ts: Defensive programming safeguards, not reachable code paths
- delete-lottery-year.ts: CLI entry point only runs in production use
- Core algorithm logic paths are fully tested
- Testing CLI entry points would require integration tests
- Industry best practice: defensive code doesn't need 100% test coverage

### Test Files Location

All tests are categorized by type and location:

**Core Library Tests** (`src/lib/tests/`):
- **[UNIT]** `lottery.unit.test.ts` - Core lottery algorithm tests (30 tests)
- **[UNIT]** `lottery-order.unit.test.ts` - Draft order logic tests (6 tests)
- **[UNIT]** `database.unit.test.ts` - Database layer tests (15 tests)
- **[UI]** `lottery-order-ui.ui.test.ts` - UI-specific lottery order tests (10 tests)
- **[API]** `api-config.api.test.ts` - Configuration API endpoint tests (13 tests)
- **[API]** `api-lottery.api.test.ts` - Lottery year API endpoint tests (8 tests)
- **[API]** `api-lottery-list.api.test.ts` - Lottery list API endpoint tests (10 tests)

**Script Tests** (`scripts/tests/`):
- **[UNIT]** `delete-lottery-year.unit.test.ts` - Delete lottery script tests (13 tests) (NEW! ⭐)

### Test Categories

Tests are clearly labeled with category prefixes:

- **[UNIT]** - Core algorithm and logic tests (64 tests)
  - ✅ Position range calculations (teams can only move ±2 spots)
  - ✅ Draft result validation
  - ✅ Weighted random selection
  - ✅ Weighted random selection edge cases
  - ✅ Single round execution
  - ✅ Multi-round execution
  - ✅ Movement constraint enforcement
  - ✅ Database file creation and initialization
  - ✅ Config save and load operations
  - ✅ Lottery sorting by year
  - ✅ Lottery save and replacement logic
  - ✅ Lottery deletion
  - ✅ Edge cases and error handling
  - ✅ Fallback mechanism testing (defensive code)
  - ✅ Delete lottery year script functionality (NEW!)
  - ✅ Script error handling and validation (NEW!)

- **[UI]** - User interface logic tests (10 tests)
  - ✅ Drag-and-drop order transformations
  - ✅ Visual state to data model conversions
  - ✅ Order reversal logic

- **[API]** - API endpoint tests (31 tests)
  - ✅ GET /api/config - Fetch configuration
  - ✅ POST /api/config - Update configuration
  - ✅ GET /api/lottery - Fetch all lotteries
  - ✅ POST /api/lottery - Save new lottery
  - ✅ GET /api/lottery/[year] - Fetch lottery by year
  - ✅ Error handling (400, 404, 500 status codes)
  - ✅ Request validation and parsing
  - ✅ Response format verification

All 105 tests should pass.

## Testing Edge Cases

### 2-Spot Movement Constraint

1. Set initial order: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
2. Run lottery multiple times
3. Verify no team ever moves more than 2 spots:
   - Team at position 1 can only pick 1-3
   - Team at position 5 can only pick 3-7
   - Team at position 10 can only pick 8-10

### Weighted Odds

1. Run lottery multiple times with different initial orders
2. Teams with worse records (higher positions) should move up more often
3. Check movement stats in seeded data for distribution

### Configuration Persistence

1. Update configuration
2. Save changes
3. Close browser
4. Reopen and verify settings are still saved

## Re-seeding Data

If you want to regenerate the test data:

```bash
# Delete existing database
rm src/data/database.json

# Re-run seed script
npm run seed
```

## Visual Checks

### Dark Theme
- ✅ All pages use dark background (gray-950)
- ✅ Text is readable (gray-100)
- ✅ Cards use gray-900 with gray-800 borders
- ✅ Blue accents for primary actions

### Responsive Design
- ✅ Test on mobile (narrow browser window)
- ✅ Verify grids stack vertically on small screens
- ✅ Navigation remains accessible

### Animations
- ✅ Card flip animations are smooth
- ✅ Movement indicators are visible
- ✅ No layout jumps during reveals

## API Endpoints (Optional Advanced Testing)

You can test the API directly with curl or Postman:

```bash
# Get configuration
curl http://localhost:4321/api/config

# Get all lotteries
curl http://localhost:4321/api/lottery

# Get specific year
curl http://localhost:4321/api/lottery/2023
```

## Common Issues & Solutions

### Port Already in Use
If you see "Port 4321 is in use", the server will automatically use the next available port (4322, 4323, etc.). Check the console output for the actual URL.

### Database Not Found
Run `npm run seed` to create the database with sample data.

### Weighted Odds Won't Save
Ensure the total equals exactly 100.0%. The validation checks for a difference of less than 0.1%.

### Tests Failing
Make sure you're in the project root directory and all dependencies are installed:
```bash
npm install
npm test
```

## Success Criteria

You've successfully tested the application when:

- ✅ Configuration saves and persists
- ✅ Lottery runs with both manual and simulated reveals
- ✅ All movements respect the 2-spot constraint
- ✅ History displays multiple years correctly
- ✅ All 105 tests pass (64 unit, 10 UI, 31 API)
- ✅ UI is responsive and animations work smoothly
- ✅ Code coverage exceeds 94%

Enjoy your Dynasty Football Draft Lottery! 🏈🎲
