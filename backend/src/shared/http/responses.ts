import type { Response } from "express";

export function sendSuccess<T>(response: Response, input: {
  statusCode?: number;
  data: T;
  meta?: Record<string, unknown>;
}) {
  return response.status(input.statusCode ?? 200).json({
    success: true,
    meta: input.meta ?? {},
    data: input.data,
  });
}

export function sendListSuccess<T>(response: Response, input: {
  statusCode?: number;
  data: T[];
  meta?: Record<string, unknown>;
}) {
  return response.status(input.statusCode ?? 200).json({
    success: true,
    meta: {
      count: input.data.length,
      ...(input.meta ?? {}),
    },
    data: input.data,
  });
}
