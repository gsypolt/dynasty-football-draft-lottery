# Dynasty Football Draft Lottery

A modern web application for conducting dynasty football draft lotteries with a weighted odds system and animated reveals. Built with Astro, TypeScript, and Tailwind CSS.

## Features

- **Configuration Page**: Set up your league with 10 teams, customize team names and logos, configure weighted odds, and set pick delay timing
- **Live Draft Lottery**: Run the lottery with manual pick-by-pick reveals or automated simulation with card flip animations
- **Historical Results**: Browse past lottery results organized by year with detailed breakdowns by round
- **2-Spot Movement Constraint**: Teams can only move up or down a maximum of 2 spots from their original position
- **Weighted Odds System**: Customizable probability system where worse teams have higher chances of moving up
- **Local JSON Storage**: All data stored in a local JSON file for simplicity

## Project Structure

```text
/
├── public/               # Static assets
├── src/
│   ├── data/            # Database JSON file (auto-generated)
│   ├── layouts/         # Astro layouts
│   │   └── Layout.astro
│   ├── lib/             # Core logic and utilities
│   │   ├── tests/       # Categorized tests
│   │   │   ├── lottery.unit.test.ts          # [UNIT] Core lottery tests
│   │   │   ├── lottery-order.unit.test.ts    # [UNIT] Order logic tests
│   │   │   ├── database.unit.test.ts         # [UNIT] Database tests
│   │   │   ├── lottery-order-ui.ui.test.ts   # [UI] UI logic tests
│   │   │   ├── api-config.api.test.ts        # [API] Config endpoint tests
│   │   │   ├── api-lottery.api.test.ts       # [API] Lottery year endpoint tests
│   │   │   └── api-lottery-list.api.test.ts  # [API] Lottery list endpoint tests
│   │   ├── database.ts  # JSON file database operations
│   │   └── lottery.ts   # Lottery algorithm
│   ├── pages/           # Astro pages (routes)
│   │   ├── api/         # API endpoints
│   │   │   ├── config.ts
│   │   │   ├── lottery.ts
│   │   │   └── lottery/[year].ts
│   │   ├── index.astro   # Live lottery page (default)
│   │   ├── config.astro  # Configuration page
│   │   ├── lottery.astro # Redirects to index
│   │   └── history.astro # Historical results
│   ├── styles/          # Global styles
│   │   └── global.css
│   └── types/           # TypeScript type definitions
│       └── index.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository:
```sh
git clone https://github.com/yourusername/dynasty-football-draft-lottery.git
cd dynasty-football-draft-lottery
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

4. Open your browser to `http://localhost:4321`

## Commands

| Command                      | Action                                           |
| :--------------------------- | :----------------------------------------------- |
| `npm install`                | Installs dependencies                            |
| `npm run dev`                | Starts local dev server at `localhost:4321`      |
| `npm run build`              | Build your production site to `./dist/`          |
| `npm run preview`            | Preview your build locally, before deploying     |
| `npm test`                   | Run all tests with Vitest UI (opens in browser) |
| `npm run test:unit`          | Run only [UNIT] tests with Vitest UI            |
| `npm run test:ui`            | Run only [UI] tests with Vitest UI              |
| `npm run test:api`           | Run only [API] tests with Vitest UI             |
| `npm run test:all`           | Run all tests with Vitest UI (same as npm test) |
| `npm run test:headless`      | Run all tests in terminal without UI            |
| `npm run test:coverage`      | Run tests with code coverage report             |
| `npm run test:coverage:ui`   | Run tests with coverage in Vitest UI            |
| `npm run seed`               | Populate database with sample data (3 years)     |
| `npm run delete-year <year>` | Delete a specific lottery year from database     |
| `npm run reset-db`           | Reset database to default configuration          |

## Usage

### 1. Configuration

Navigate to the configuration page (`/config`) to configure your league:

- **Number of Teams**: Fixed at 10 teams
- **Number of Rounds**: Set how many rounds of picks (1-10)
- **Team Names**: Customize each team name
- **Team Logos**: Provide logo URLs for each team
- **Weighted Odds**: Customize the percentage odds for each position (must total 100%)
- **Pick Delay**: Set the delay between automated picks in seconds

Click "Save Configuration" to save your settings.

### 2. Run Live Lottery

Navigate to the home page (`/`):

1. **Set Initial Order**: Drag and drop teams to set the initial draft order (Position 10 = Worst Team, Position 1 = Champion)
2. **Start Lottery**: Click "Start Lottery" to run the lottery algorithm
3. **Reveal Picks**:
   - Click "Reveal Next Pick" to manually reveal each pick
   - Click "Simulate Remaining Picks" to automatically reveal all picks with delays
4. **View Results**: Each pick shows the team, original position, and movement (stayed/moved up/moved down)
5. **Save Results**: After all rounds complete, click "Save Lottery Results"

### 3. View History

Navigate to `/history` to view past lottery results:

- Select a year from the left sidebar
- View detailed results for each round
- See which teams moved up, down, or stayed in their position

## Lottery Algorithm

The lottery algorithm ensures the following constraints:

- **2-Spot Maximum Movement**: No team can move more than 2 spots from their original position
- **Weighted Odds**: Each position has customizable odds for favorable outcomes
- **Constraint Satisfaction**: Uses a retry mechanism to ensure valid lottery results

### Default Weighted Odds

| Position | Team Type | Default Odds |
|----------|-----------|--------------|
| 10       | Worst     | 25.0%        |
| 9        |           | 18.8%        |
| 8        |           | 14.1%        |
| 7        |           | 10.5%        |
| 6        |           | 7.9%         |
| 5        |           | 6.2%         |
| 4        |           | 6.2%         |
| 3        |           | 4.7%         |
| 2        |           | 3.5%         |
| 1        | Champion  | 3.1%         |

## Testing

The lottery algorithm is thoroughly tested with categorized tests:

### Test Categories

Tests are organized by type and clearly labeled:

- **[UNIT]** - Core algorithm and logic tests
  - Position range calculations
  - Draft result validation
  - Weighted random selection
  - Lottery execution logic
  - 2-spot movement constraint enforcement

- **[UI]** - User interface logic tests
  - Drag-and-drop order handling
  - Visual state management
  - UI-specific transformations

- **[API]** - API endpoint tests (31 tests)
  - GET/POST /api/config - Configuration endpoints
  - GET/POST /api/lottery - Lottery list and save endpoints
  - GET /api/lottery/[year] - Specific year lottery endpoint
  - Error handling and validation
  - Request/response format verification

### Running Tests

Run all tests:
```sh
npm test
```

Run specific test categories:
```sh
# Run only unit tests
npm run test:unit

# Run only UI tests
npm run test:ui

# Run only API tests
npm run test:api
```

Run tests in terminal (no UI):
```sh
npm run test:headless
```

### Code Coverage

View code coverage to identify quality gaps and areas needing more tests:

```sh
# Run tests with coverage report in terminal
npm run test:coverage

# Run tests with coverage in Vitest UI
npm run test:coverage:ui
```

**Current Coverage:**
- **Overall: 95.79%** - Excellent coverage across all code! 🎉
- **Database Layer: 100%** - All database operations fully tested
- **API Endpoints: 100%** - All API routes fully tested
- **Lottery Algorithm: 90.41%** - Core logic well covered

**Coverage Reports:**
- Terminal output shows summary after running tests
- HTML report available at `coverage/index.html`
- Open in browser to see line-by-line coverage details

**Coverage Thresholds:**
- All exceed 70% minimum requirement
- Lines: 95.79% ✅
- Functions: 100% ✅
- Branches: 95.12% ✅
- Statements: 95.79% ✅

## Database Management

### Resetting the Database

If you need to reset the database to the default configuration (e.g., after running tests):

```sh
npm run reset-db
```

This will delete the existing `database.json` and recreate it with the default team configuration including:
- 10 teams with names and logos
- 5 rounds
- Default weighted odds system

**Note:** After running tests with `npm run test:coverage`, the database may be reset. Use `npm run reset-db` to restore your team configuration.

### Deleting a Lottery Year

To remove a specific lottery year from the database while preserving the configuration:

```sh
npm run delete-year <year>
```

Example:
```sh
npm run delete-year 2023
```

This will:
- Remove all lottery results for the specified year
- Keep your team configuration intact
- Keep weighted odds and other settings unchanged
- Preserve all other lottery years

## Technologies

- **[Astro](https://astro.build)**: Modern web framework
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[Vitest](https://vitest.dev/)**: Fast unit testing framework

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
