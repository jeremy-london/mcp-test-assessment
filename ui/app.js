const el = (id) => document.getElementById(id);
const toolList = el('tool-list');
const filterBox = el('filter');
const argsBox = el('args');
const argsError = el('args-error');
const runButton = el('run');
const statusEl = el('status');
const requestEl = el('request');
const responseEl = el('response');
const historyEl = el('history');

let tools = [];
let current = null;
let callId = 0;
const history = [];

const pretty = (value) => JSON.stringify(value, null, 2);

// Builds a skeleton of required fields so the editor starts from a valid shape.
function skeleton(schema) {
  const out = {};
  for (const key of schema.required ?? []) {
    const type = schema.properties?.[key]?.type;
    out[key] =
      type === 'number' || type === 'integer' ? 0 : type === 'array' ? [] : type === 'object' ? {} : '';
  }
  return out;
}

function renderTools() {
  const needle = filterBox.value.trim().toLowerCase();
  toolList.innerHTML = '';
  for (const tool of tools.filter((t) => t.name.includes(needle))) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = tool.name;
    button.dataset.testid = `tool-${tool.name}`;
    button.setAttribute('aria-current', String(tool.name === current?.name));
    button.addEventListener('click', () => selectTool(tool.name));
    li.append(button);
    toolList.append(li);
  }
}

function selectTool(name) {
  current = tools.find((t) => t.name === name);
  el('tool-name').textContent = current.name;
  el('tool-description').textContent = current.description;
  el('tool-schema').textContent = pretty(current.inputSchema);
  const examples = el('examples');
  examples.innerHTML = '';
  const chips = current.examples.map((example) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = example.label;
    chip.dataset.testid = `example-${example.label.toLowerCase().replace(/\s+/g, '-')}`;
    chip.addEventListener('click', () => loadExample(example, chips));
    examples.append(chip);
    return chip;
  });

  // Always start with the first example; fall back to a skeleton when a tool has none.
  if (current.examples.length > 0) {
    loadExample(current.examples[0], chips);
  } else {
    argsBox.value = pretty(skeleton(current.inputSchema));
    validateArgs();
  }
  if (current.examples.length === 0) {
    examples.textContent = 'No examples for this tool.';
  }
  renderTools();
}

function loadExample(example, chips) {
  argsBox.value = pretty(example.args);
  validateArgs();
  for (const chip of chips) {
    chip.setAttribute('aria-pressed', String(chip.textContent === example.label));
  }
}

function parseArgs() {
  return JSON.parse(argsBox.value);
}

function validateArgs() {
  try {
    parseArgs();
    argsError.hidden = true;
    runButton.disabled = false;
    return true;
  } catch (err) {
    argsError.textContent = `Not valid JSON: ${err.message}`;
    argsError.hidden = false;
    runButton.disabled = true;
    return false;
  }
}

function renderHistory() {
  historyEl.innerHTML = '';
  for (const entry of history) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'link';
    button.dataset.testid = 'history-entry';
    button.textContent = `${entry.tool} · ${entry.state} · ${entry.durationMs} ms`;
    button.addEventListener('click', () => {
      selectTool(entry.tool);
      argsBox.value = pretty(entry.args);
      validateArgs();
    });
    li.append(button);
    historyEl.append(li);
  }
}

async function run() {
  if (!current || !validateArgs()) return;
  const args = parseArgs();
  const id = ++callId;
  const request = { jsonrpc: '2.0', id, method: 'tools/call', params: { name: current.name, arguments: args } };
  requestEl.textContent = pretty(request);
  responseEl.textContent = '';
  statusEl.dataset.state = 'running';
  statusEl.textContent = 'Running…';
  runButton.disabled = true;

  const started = performance.now();
  try {
    const res = await fetch(`/api/tools/${current.name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    const body = await res.json();
    const durationMs = Math.round(performance.now() - started);
    const state = body.isError ? 'error' : 'ok';
    const code = body.isError ? body.data?.error?.code : 'OK';

    statusEl.dataset.state = state;
    statusEl.textContent = `${code} · ${durationMs} ms`;
    responseEl.textContent = pretty({ jsonrpc: '2.0', id, result: body.data ?? body, isError: body.isError });

    history.unshift({ tool: current.name, args, state: code, durationMs });
    history.splice(20);
    renderHistory();
  } catch (err) {
    statusEl.dataset.state = 'error';
    statusEl.textContent = `Request failed: ${err.message}`;
  } finally {
    runButton.disabled = false;
  }
}

filterBox.addEventListener('input', renderTools);
argsBox.addEventListener('input', validateArgs);
runButton.addEventListener('click', run);
el('clear-history').addEventListener('click', () => {
  history.length = 0;
  renderHistory();
});

async function init() {
  const res = await fetch('/api/tools');
  tools = await res.json();
  renderTools();
  if (tools.length > 0) selectTool(tools[0].name);
}

init();
