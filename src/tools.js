import { ToolError } from './errors.js';
import { store } from './store.js';
import { fetchPage, fetchRate, pollJob } from './mock-upstream.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function requireString(args, key, max) {
  const value = args[key];
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > max) {
    throw new ToolError('INVALID_ARGUMENT', `"${key}" must be a non-empty string up to ${max} characters`);
  }
  return value;
}

function requireId(args) {
  return requireString(args, 'id', 64);
}

export const TOOLS = [
  {
    name: 'echo',
    description: 'Returns the message it was given.',
    inputSchema: {
      type: 'object',
      properties: { message: { type: 'string' } },
      required: ['message'],
      additionalProperties: false,
    },
    handler: async (args) => {
      if (typeof args.message !== 'string') {
        throw new ToolError('INVALID_ARGUMENT', '"message" must be a string');
      }
      return { message: args.message };
    },
  },
  {
    name: 'add_numbers',
    description: 'Returns the sum of an array of numbers. Empty array sums to 0.',
    inputSchema: {
      type: 'object',
      properties: { numbers: { type: 'array', items: { type: 'number' } } },
      required: ['numbers'],
      additionalProperties: false,
    },
    handler: async (args) => {
      if (!Array.isArray(args.numbers)) {
        throw new ToolError('INVALID_ARGUMENT', '"numbers" must be an array');
      }
      return { sum: args.numbers.reduce((a, b) => a + b, 0) };
    },
  },
  {
    name: 'get_book',
    description: 'Returns one book by id.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
      additionalProperties: false,
    },
    handler: async (args) => {
      const book = store.get(requireId(args));
      if (!book) {
        throw new ToolError('NOT_FOUND', 'book not found');
      }
      return { book };
    },
  },
  {
    name: 'list_books',
    description: 'Paginated list of books. limit is 1-100 (default 10); offset is >= 0 (default 0).',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100 },
        offset: { type: 'integer', minimum: 0 },
      },
      additionalProperties: false,
    },
    handler: async (args) => {
      const limit = args.limit ?? 10;
      const offset = args.offset ?? 0;
      if (!Number.isInteger(limit) || !Number.isInteger(offset) || offset < 0 || limit > 100) {
        throw new ToolError('INVALID_ARGUMENT', 'limit must be an integer 1-100; offset must be an integer >= 0');
      }
      const all = store.all();
      const items = await fetchPage(all, { offset, size: limit });
      const next = offset + items.length;
      return { items, total: all.length, nextOffset: next < all.length ? next : null };
    },
  },
  {
    name: 'search_books',
    description: 'Finds books whose title contains the query (case-insensitive substring match).',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
      additionalProperties: false,
    },
    handler: async (args) => {
      const query = requireString(args, 'query', 200);
      const items = store.all().filter((book) => book.title.includes(query));
      return { items, count: items.length };
    },
  },
  {
    name: 'create_book',
    description: 'Adds a book. Year must be an integer from 1450 up to the current year.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        author: { type: 'string' },
        year: { type: 'integer' },
      },
      required: ['title', 'author', 'year'],
      additionalProperties: false,
    },
    handler: async (args) => {
      const title = requireString(args, 'title', 200);
      const author = requireString(args, 'author', 100);
      const year = args.year;
      if (!Number.isInteger(year) || year < 1450 || year > 2024) {
        throw new ToolError('INVALID_ARGUMENT', 'year must be an integer between 1450 and the current year');
      }
      return { book: store.insert({ title, author, year }) };
    },
  },
  {
    name: 'update_book',
    description: 'Partially updates a book. Send any of title, author, year in patch.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        patch: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            author: { type: 'string' },
            year: { type: 'integer' },
          },
          additionalProperties: false,
        },
      },
      required: ['id', 'patch'],
      additionalProperties: false,
    },
    handler: async (args) => {
      const id = requireId(args);
      const existing = store.get(id);
      if (!existing) {
        throw new ToolError('NOT_FOUND', 'book not found');
      }
      if (!args.patch || typeof args.patch !== 'object') {
        throw new ToolError('INVALID_ARGUMENT', '"patch" must be an object');
      }
      return { book: store.replace(id, { id, ...args.patch }) };
    },
  },
  {
    name: 'delete_book',
    description: 'Deletes a book by id. Returns NOT_FOUND if no book has that id.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
      additionalProperties: false,
    },
    handler: async (args) => {
      const id = requireId(args);
      store.remove(id);
      return { deleted: true, id };
    },
  },
  {
    name: 'get_exchange_rate',
    description: 'Returns the rate to convert 1 unit of "from" into "to". Currencies are 3-letter codes (USD, EUR, GBP, JPY).',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string' },
        to: { type: 'string' },
      },
      required: ['from', 'to'],
      additionalProperties: false,
    },
    handler: async (args) => {
      const from = requireString(args, 'from', 3).toUpperCase();
      const to = requireString(args, 'to', 3).toUpperCase();
      if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) {
        throw new ToolError('INVALID_ARGUMENT', 'currency codes must be 3 letters');
      }
      if (from === to) {
        return { from, to, rate: 1 };
      }
      const rate = await fetchRate(from, to);
      return { from, to, rate: Number(rate.toFixed(4)) };
    },
  },
  {
    name: 'wait_for_job',
    description: 'Waits until a background job finishes and returns its final status (done or failed).',
    inputSchema: {
      type: 'object',
      properties: { jobId: { type: 'string' } },
      required: ['jobId'],
      additionalProperties: false,
    },
    handler: async (args) => {
      const jobId = requireString(args, 'jobId', 64);
      let snapshot = await pollJob(jobId);
      while (snapshot.status === 'running') {
        await sleep(5);
        snapshot = await pollJob(jobId);
      }
      return { jobId, ...snapshot };
    },
  },
];
