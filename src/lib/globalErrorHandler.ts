import type { NextFunction, Request, Response } from "express";

type ErrorWithStatus = {
  statusCode?: number;
  status?: string;
  message?: string;
  errorMessage?: any;
};

export const globalErrorHandler = function (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.errorMessage = err.errorMessage || null;

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    errorMessage: err.errorMessage,
  });
};
