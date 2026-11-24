# Submission

Fill in each section as you go. Keep it short and specific. Link to files and tests rather than pasting code.

## Phase 1 - Test strategy (`TEST-PLAN.md`)

- Scope and what you chose not to test, with a reason.
- Risk ranking for the ten tools. What breaks first, and what it costs.
- Test levels you used (direct tool calls, MCP protocol, other) and why.
- Pass/fail criteria, including what counts as a hang or a timeout.

## Phase 2 - Automated suite and findings (`test/`, `e2e/`, `BUGS.md`)

- A test harness: `test/` for server tests and `e2e/` for Playwright UI tests. Both run from `npm` scripts, and `npm run check` runs both.

- How to run the suite and how long it takes.
- Coverage: which tools and edge cases are covered. Name the gaps.
- Findings: every defect you found, in `BUGS.md`, with a repro, expected and actual behavior, and severity.
- Which findings are timing-related and how your tests detect them without waiting for the full timeout on every run.

## Phase 3 - Changed requirements

The product team asks for two changes:

1. Upstream latency becomes realistic. Set `UPSTREAM_LATENCY_MS=150` and `UPSTREAM_JITTER_MS=200`, and the suite must still pass reliably. Explain how you keep timing-based checks from flaking.
2. Add a CI workflow (for example GitHub Actions) that runs the suite on every pull request.

Describe what you changed, how you verified it, and what risk remains.

## Checks run

- Commands you ran and their results.

## Gaps and next steps

- What you would do next with more time.
