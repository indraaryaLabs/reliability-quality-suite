# Defect findings

Both findings below were reproduced on 24 September 2026 against Reliability Command Center commit `4089b177e7d6cdd5977467e48d94239c31eacb83`, on local Windows/Chromium with Playwright 1.63.0. They are product findings, not failures of the QA suite. The associated tests use Playwright's `test.fail` marker: an unexpected fix makes the suite signal that this document needs updating. No production incident is claimed.

## QA-DEFECT-01 — API accepts an interval forbidden by the form

- **Severity:** Medium (validation consistency and potentially excessive scheduled checks; no measured production impact).
- **Precondition:** Local API running with isolated `.sut/db.json`.
- **Steps:** Send `POST /api/services` with a valid name, URL, host, category, and `interval: 9`; then delete the returned service ID.
- **Expected:** HTTP 400 because the form has `min="10"` and its submit logic states that the minimum poll interval is 10 seconds.
- **Actual:** HTTP 201, returning a service whose interval is 9 seconds. The scheduler accepts that value.
- **Evidence:** `tests/known-defects.spec.ts` case `QA-DEFECT-01` reproduced this API response; the UI boundary is also exercised in `QA-UI-02`.
- **Suggested fix:** Enforce a finite integer interval of at least 10 seconds in the API, with a negative/boundary test. Align the error message with the form.

## QA-DEFECT-02 — Visible form label is not associated with its input

- **Severity:** Medium (form accessibility; no claim of formal WCAG conformance assessment).
- **Precondition:** Open the dashboard in Chromium and select **Add Service Spec**.
- **Steps:** Locate the **Service Name \*** field by its visible label using `getByLabel('Service Name *')`.
- **Expected:** The label identifies and focuses the name input, so assistive technology and label-based automation can determine its accessible name.
- **Actual:** The visible `<label>` has no `htmlFor` and does not wrap the input; the input has an ID but no associated label. The label-based locator finds no field.
- **Evidence:** `tests/known-defects.spec.ts` case `QA-DEFECT-02` reproduced the missing association. Other form labels in the same component warrant review, but this finding establishes only the name field.
- **Suggested fix:** Add `htmlFor="input-service-name"` to the label and verify keyboard/screen-reader naming; check the remaining form labels separately.
