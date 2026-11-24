# Configuring the MCP server

This is the single place for connecting the server to AI tools and clients, plus environment variables, the local inspector UI, and Playwright.

The server speaks MCP over stdio. Any MCP client launches it with a command and args.

## Before you start

- Run `npm install` from the repo root and use Node 24 (`nvm use`).
- Clients don't run from your project folder, so use the **absolute path** to `src/index.js` in every config. Get it with:

  ```sh
  echo "$(pwd)/src/index.js"
  ```

- Clients use the `node` on their PATH. Check `node -v` in the same shell. If a client can't find `node`, use the full path from `which node`.

## 1. Claude Code

This repo includes `.mcp.json`, so Claude Code picks the server up when you open the project:

```json
{
  "mcpServers": {
    "mcp-test-assessment": {
      "command": "node",
      "args": ["src/index.js"],
      "env": { "TOOL_TIMEOUT_MS": "500" }
    }
  }
}
```

To add it yourself with the CLI:

```sh
claude mcp add mcp-test-assessment \
  --scope project \
  --env TOOL_TIMEOUT_MS=500 \
  -- node /ABSOLUTE/PATH/TO/mcp-test-assessment/src/index.js

claude mcp list                        # should show mcp-test-assessment: connected
claude mcp get mcp-test-assessment     # shows the command and env
```

Use `--scope user` to make the server available in every project. Inside a Claude Code session, run `/mcp` to see its status and tools.

## 2. Codex CLI

```sh
codex mcp add mcp-test-assessment \
  --env TOOL_TIMEOUT_MS=500 \
  -- node /ABSOLUTE/PATH/TO/mcp-test-assessment/src/index.js

codex mcp list
```

Codex stores this in `~/.codex/config.toml`. You can also write it there by hand:

```toml
[mcp_servers.mcp-test-assessment]
command = "node"
args = ["/ABSOLUTE/PATH/TO/mcp-test-assessment/src/index.js"]
env = { TOOL_TIMEOUT_MS = "500" }
```

## 3. Generic MCP client (JSON)

Most other clients accept this shape: Claude Desktop, Cursor, VS Code, and similar. Paste it into the client's MCP config file.

```json
{
  "mcpServers": {
    "mcp-test-assessment": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/mcp-test-assessment/src/index.js"],
      "env": {
        "TOOL_TIMEOUT_MS": "500"
      }
    }
  }
}
```

For Claude Desktop, the file is `claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/`; Windows: `%APPDATA%\Claude\`). Restart the app after editing.

## 4. Agent instructions

Agents work better with the repo's rules in front of them. Paste this into your agent's instructions (system prompt, project rules, or config file):

```text
This repo is an MCP server with ten tools (see src/tools.js and src/examples.js).
Run `npm test` for unit tests and `npm run e2e` for Playwright UI tests. Use `npm run e2e:ui` to step through them in Playwright's UI mode.
Do not edit files in src/ unless the task says so; write tests against the server as it is.
Use callTool() from src/server.js for direct calls, or the MCP tools once the server is connected.
Report what you ran and what passed or failed.
```

## 5. Raw stdio check (no client)

```sh
printf '%s\n' \
 '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"manual","version":"1"}}}' \
 '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"echo","arguments":{"message":"hi"}}}' \
 | node src/index.js
```

## Environment variables

| Variable | Default | Use it to |
| --- | --- | --- |
| `TOOL_TIMEOUT_MS` | `500` | Make hangs fail faster in tests, or give slow calls more room |
| `UPSTREAM_LATENCY_MS` | `0` | Simulate a slow upstream API |
| `UPSTREAM_JITTER_MS` | `0` | Add random latency (Phase 3 flake test) |
| `PORT` | `3000` | Change the local inspector UI port (`npm run ui`) |

Set them in the client config's `env` block, or on the command line. For example, `TOOL_TIMEOUT_MS=200 npm run ui`.

## Local inspector UI

```sh
npm run ui          # http://127.0.0.1:3000
PORT=4000 npm run ui
```

The UI lists the tools, shows each schema, fills in the first example input, runs the tool, and shows the JSON-RPC request and response with timing and history. It calls the same `callTool()` as the MCP server. Results show a status line (`data-testid="status"`), the request (`data-testid="request"`), and the response (`data-testid="response"`).

## Playwright harness

```sh
npx playwright install chromium   # first time only
npm run e2e                       # runs the tests; starts the UI automatically
npm run e2e:ui                    # Playwright's interactive UI mode
```

The README has more on Playwright's UI mode and debugging.
