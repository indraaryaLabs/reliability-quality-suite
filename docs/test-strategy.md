# Test strategy

## System under test

Reliability Command Center at commit `4089b177e7d6cdd5977467e48d94239c31eacb83`. Tests run against local API and frontend processes and an ignored local JSON data file. They do not call a public deployment or use a user account.

## Risks and priorities

1. An inventory change could be acknowledged but not persist or appear in the UI.
2. Invalid input could create unusable scheduled checks.
3. A missing or unavailable backend could leave the frontend unusable.
4. Search and category filters could hide or misidentify services.

## Coverage matrix

| ID | Requirement or risk | Type | Expected evidence |
| --- | --- | --- | --- |
| QA-API-01 | Inventory is readable and has expected contract fields | API | 200 and structured list |
| QA-API-02 | Missing required data is rejected without creating an entry | API negative | 400 and unchanged list |
| QA-API-03 | Inventory changes persist through create, update, delete | API integration | 201/200 responses and GET verification |
| QA-API-04 | Unknown service operations fail clearly | API negative | 404 for update, delete, recheck, toggle |
| QA-API-05 | CPU simulation changes health and reset restores it | API integration | DEGRADED then UP; reset in cleanup |
| QA-UI-01 | Search and category filters work together | Browser | Matching card, empty state, restored card |
| QA-UI-02 | UI rejects incomplete data and too-short intervals | Browser negative | Validation messages; no submission |
| QA-UI-03 | User completes the inventory lifecycle | Browser E2E | Add, edit, delete visible and persisted |
| QA-UI-04 | Inventory stays usable if SSE connection is unavailable | Browser resilience | Offline mode and searchable cards |
| QA-DEFECT-01 | API should enforce the same 10-second minimum as the UI | API boundary | Currently an expected failure with cleanup |
| QA-DEFECT-02 | Visible form label should identify its control programmatically | Browser accessibility | Currently an expected failure |

## Execution and oracles

Run serially because the source application stores inventory in one JSON file. API tests use HTTP status and follow-up reads as oracles; browser tests use user-visible text and controls. Fixtures use unique names and are deleted even after assertion failures. Retries are reserved for CI diagnostics; a retry passing does not prove a defect is fixed. Test results and screenshots from failures remain artifacts, not permanent claims.

## Out of scope

Load, security penetration, actual external HTTP/TCP health, production uptime, cross-browser certification, and the truth of seeded business metrics. These need separate environments or evidence. Automated checks do not constitute full accessibility certification.
