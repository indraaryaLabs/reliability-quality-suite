# Reliability Quality Suite — design

## Goal

Create an independent, reproducible QA portfolio project for the public Reliability Command Center. The repository must demonstrate test design, API and browser execution, defect reporting, and CI evidence without claiming professional QA employment or inventing findings.

## Approaches considered

1. **Test the existing public application (chosen).** Reuse a real service dashboard with inventory, API, streaming, and simulation flows. This provides realistic behavior and avoids building a toy application solely to test it.
2. Test a newly built frontend portfolio app. This would share setup effort but reduce portfolio breadth and delay QA evidence until the second project exists.
3. Build a separate QA demo app. This doubles implementation scope and risks showcasing development more than testing.

## Architecture and data flow

The suite pins a public source commit and installs it in an ignored `.sut/` directory. Playwright starts the API and Vite frontend locally, then runs browser tests through the UI and API tests against the isolated local server. Every mutating test creates a uniquely named service and removes it in cleanup. Serial execution prevents shared JSON persistence and simulation controls from racing. The suite never targets the public deployment or private user data.

## Deliverables

- A concise test strategy, requirement-to-test matrix, and evidence of executed results.
- Passing API tests for inventory read/create/update/delete, validation, and missing resources.
- Passing browser tests for search/filter, form validation, and a complete add/edit/delete flow.
- At least one independently reproduced defect, only if observed, with expected/actual behavior and reproduction steps.
- GitHub Actions running the suite in Chromium and uploading the HTML report.

## Error handling and boundaries

Setup fails if the pinned source is unavailable or an existing `.sut/` checkout is at another commit. Tests fail on response or UI contract violations, but use time-bounded web-first assertions rather than sleeps. A reported product defect remains a documented finding; it is not silently changed in the source application. No production data, accounts, external service credentials, accessibility-certification claims, or invented bug counts are part of this project.

## Acceptance

From a clean checkout, `npm ci`, `npm run setup:sut`, `npx playwright install chromium`, and `npm test` complete. A recruiter can inspect the test matrix, code, CI result, and genuine findings separately. The source application's existing uncommitted `server.ts` change is untouched.
