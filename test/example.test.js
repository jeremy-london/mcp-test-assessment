// Starter example. It shows the two ways to reach the server:
//   1. callTool(): calls a tool directly and returns the MCP result
//   2. an MCP Client over an in-memory transport: the real protocol path
// It is a starting point, not a complete suite.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { callTool, createServer } from '../src/server.js';
import { resetState } from '../src/state.js';

const parse = (result) => JSON.parse(result.content[0].text);

beforeEach(() => resetState());

test('echo returns the message it was given', async () => {
  const result = await callTool('echo', { message: 'hello' });

  assert.equal(result.isError, false);
  assert.deepEqual(parse(result), { message: 'hello' });
});

test('tools/list over MCP exposes the ten tools', async () => {
  const server = createServer();
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  try {
    const { tools } = await client.listTools();
    assert.equal(tools.length, 10);
  } finally {
    await client.close();
  }
});
