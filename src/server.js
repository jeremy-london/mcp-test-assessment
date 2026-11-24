import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ToolError, ToolTimeoutError } from './errors.js';
import { TOOLS } from './tools.js';

export const DEFAULT_TIMEOUT_MS = Number(process.env.TOOL_TIMEOUT_MS ?? 500);

const success = (value) => ({
  content: [{ type: 'text', text: JSON.stringify(value) }],
  isError: false,
});

const failure = (code, message) => ({
  content: [{ type: 'text', text: JSON.stringify({ error: { code, message } }) }],
  isError: true,
});

// Runs one tool with a deadline. Returns an MCP CallToolResult; never throws.
export async function callTool(name, args = {}, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) {
    return failure('UNKNOWN_TOOL', `no tool named "${name}"`);
  }

  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new ToolTimeoutError(name, timeoutMs)), timeoutMs);
  });

  try {
    return success(await Promise.race([tool.handler(args ?? {}), deadline]));
  } catch (err) {
    if (err instanceof ToolError || err instanceof ToolTimeoutError) {
      return failure(err.code, err.message);
    }
    return failure('INTERNAL', err.message);
  } finally {
    clearTimeout(timer);
  }
}

export function createServer(options) {
  const server = new Server(
    { name: 'mcp-test-assessment', version: '1.0.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) =>
    callTool(request.params.name, request.params.arguments ?? {}, options),
  );

  return server;
}
