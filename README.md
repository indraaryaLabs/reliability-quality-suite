# Reliability Quality Suite

Independent QA portfolio project for [Reliability Command Center](https://github.com/indraaryaLabs/reliability-command-center). It tests the application's inventory API and key browser journeys without relying on a production account or external monitoring targets.

The system under test is pinned to commit `4089b177e7d6cdd5977467e48d94239c31eacb83` and cloned into the ignored `.sut/` directory. Its seeded status and uptime numbers are demo data, not evidence of real service reliability.

## What to inspect

- [Test strategy and coverage matrix](docs/test-strategy.md)
- [API checks](tests/api.spec.ts): contract shape, required-field validation, persistence, and missing resources
- [Browser checks](tests/ui.spec.ts): search/filter, form validation, add/edit/delete, and offline fallback
- [Defect findings](docs/findings.md): reproduced issues and limits, if any
- [CI workflow](.github/workflows/qa.yml): automated Chromium run and downloadable HTML report

The suite has nine behavioral checks and two **expected-failure** regression checks for reproduced product findings. Expected failures are deliberately visible in the test report; they do not mean the defects are fixed.

## Run locally

Requires Node.js 24+, npm, Git, and ports 3000/3001 free.

```bash
npm ci
npm run setup:sut
npx playwright install chromium
npm run typecheck
npm test
```

The setup command clones a fixed public commit; if `.sut/` already exists at a different commit it stops instead of overwriting it. `npm test` starts both local servers and runs tests serially because the application uses one JSON data file. Each mutating test removes its own fixture. The suite does not touch any other checkout of Reliability Command Center.

Open the most recent HTML report with `npm run test:report`. The GitHub Actions workflow runs the same checks and stores the report as an artifact. A green test run covers only the cases in the matrix; it is not a claim that the product is bug-free, accessible in every context, or production-ready.
