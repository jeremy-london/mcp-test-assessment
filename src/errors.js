export class ToolError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ToolError';
    this.code = code;
  }
}

export class ToolTimeoutError extends Error {
  constructor(tool, timeoutMs) {
    super(`tool "${tool}" did not finish within ${timeoutMs}ms`);
    this.name = 'ToolTimeoutError';
    this.code = 'TIMEOUT';
  }
}
