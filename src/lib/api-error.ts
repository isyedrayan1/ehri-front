/**
 * API Error class for structured backend errors.
 * Parses the uniform error envelope: { error, detail, code }
 */
export class ApiError extends Error {
  public readonly code: number;
  public readonly type: string;
  public readonly detail: string;

  constructor(code: number, detail: string, type: string = 'APIError') {
    super(`[${code}] ${detail}`);
    this.name = 'ApiError';
    this.code = code;
    this.type = type;
    this.detail = detail;
  }

  /** True if the user has exceeded the rate limit (60 req/min/IP) */
  get isRateLimited(): boolean {
    return this.code === 429;
  }

  /** True if the external data source (OpenAQ / Open-Meteo) is down */
  get isExternalFailure(): boolean {
    return this.code === 502;
  }

  /** True if the requested city was not found */
  get isNotFound(): boolean {
    return this.code === 404;
  }

  /** True if the request was malformed */
  get isValidationError(): boolean {
    return this.code === 422;
  }
}
