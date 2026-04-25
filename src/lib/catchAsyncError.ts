import type { NextFunction, Request, Response } from "express";

export function catchAyncError(fun: Function) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      await fun(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
