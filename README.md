# AI QA Assessment

This is our example Model Context Protocol (MCP) server with ten tools. It runs entirely in memory, with no API keys or external services. Your job is to test it.

## 1. Set up

1. **Create your repository.** On this repo's GitHub page, select **Use this template**, then **Create a new repository**. Set visibility to **Private**.
2. **Clone it** and open a terminal in the folder.
3. **Use Node 24.** The version is pinned in `.nvmrc`. If you use nvm: `nvm install && nvm use`.
4. **Install dependencies:**

   ```sh
   npm install
   ```

5. **Check that it works:**

   ```sh
   npm test          # starter unit tests
   npm run e2e       # starter Playwright tests (first time: npx playwright install chromium)
   ```

You should see both pass. Everything runs in a few seconds.

## 2. Try the server

| Command | What it does |
| --- | --- |
| `npm run ui` | Opens a local inspector at `http://127.0.0.1:3000`. Pick a tool, edit its JSON input, and run it. |
| `npm start` | Runs the MCP server over stdio, for connecting a client. |
| `npm run e2e:ui` | Opens Playwright's UI mode to step through browser tests. |

To connect an AI tool such as Claude Code or Codex CLI, follow **[docs/CONFIGURATION.md](docs/CONFIGURATION.md)**.

Sample inputs for every tool are in **[docs/EXAMPLES.md](docs/EXAMPLES.md)**.

## 3. Your task

Work through the three phases in **[SUBMISSION.md](SUBMISSION.md)**:

1. **Test strategy.** Write `TEST-PLAN.md`: what you will test, what you will skip, and how you decide pass or fail.
2. **Automated suite.** Build your test harness in `test/` (server tests) and `e2e/` (browser tests). Record every defect you find in `BUGS.md`.
3. **Changed requirements.** The product team changes the requirements. Update your suite and explain how you verified it.

Rules:

- Do not change `src/` unless a phase asks you to. Test the server as it is.
- Use any tools you normally use, including AI assistants.

## 4. What to submit

Commit everything to your private repository, then share the repo with us. Your repo must include:

- `TEST-PLAN.md`, `BUGS.md`, and `SUBMISSION.md`, filled in.
- Your tests in `test/` and `e2e/`, runnable with `npm run check`.
- Any changes for Phase 3, such as a CI workflow.

In your walkthrough, be ready to:

- Run the suite and show the results.
- Explain what you tested, what you did not test, and why.
- Explain how you know your tests are reliable.
- Demonstrate at least one bug you found.
