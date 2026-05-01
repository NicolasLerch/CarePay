export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: Record<string, unknown> | unknown[] | null;

  public constructor(
    message: string,
    statusCode = 500,
    code?: string,
    details: Record<string, unknown> | unknown[] | null = null,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code ?? getDefaultErrorCode(statusCode);
    this.details = details;
  }
}

function getDefaultErrorCode(statusCode: number): string {
  if (statusCode === 400) {
    return "BAD_REQUEST";
  }

  if (statusCode === 404) {
    return "NOT_FOUND";
  }

  if (statusCode === 409) {
    return "CONFLICT";
  }

  return "INTERNAL_SERVER_ERROR";
}
