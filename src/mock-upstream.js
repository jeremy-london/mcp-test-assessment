// Mock upstream API used by tools that simulate a remote service.
// Latency is configurable via env; defaults are near-zero so the suite stays fast.
const LATENCY_MS = Number(process.env.UPSTREAM_LATENCY_MS ?? 0);
const JITTER_MS = Number(process.env.UPSTREAM_JITTER_MS ?? 0);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A promise that never settles: models an upstream that never responds.
const neverResponds = () => new Promise(() => {});

async function latency() {
  const ms = LATENCY_MS + (JITTER_MS > 0 ? Math.random() * JITTER_MS : 0);
  if (ms > 0) await delay(ms);
}

// Units per 1 USD.
const RATES_PER_USD = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 151.2 };

export async function fetchRate(from, to) {
  await latency();
  if (!Object.hasOwn(RATES_PER_USD, from) || !Object.hasOwn(RATES_PER_USD, to)) {
    return neverResponds();
  }
  return RATES_PER_USD[to] / RATES_PER_USD[from];
}

export async function fetchPage(items, { offset, size }) {
  await latency();
  if (size === 0) {
    return neverResponds();
  }
  return items.slice(offset, offset + size);
}

const JOBS = {
  'job-ok': { polls: 3, final: { status: 'done', result: { rows: 42 } } },
  'job-failed': { polls: 1, final: { status: 'failed', error: 'disk quota exceeded' } },
};
const pollCounts = new Map();

export async function pollJob(jobId) {
  if (!Object.hasOwn(JOBS, jobId)) {
    return neverResponds();
  }
  const count = (pollCounts.get(jobId) ?? 0) + 1;
  pollCounts.set(jobId, count);
  await latency();
  const job = JOBS[jobId];
  return count < job.polls ? { status: 'running' } : job.final;
}

export function resetUpstream() {
  pollCounts.clear();
}
