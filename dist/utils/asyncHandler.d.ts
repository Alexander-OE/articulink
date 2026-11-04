import type { Request, Response, NextFunction, RequestHandler } from "express";
/**
 * Wraps an async route handler so any rejected promise is forwarded to the
 * centralized error-handling middleware instead of crashing the process.
 */
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler;
//# sourceMappingURL=asyncHandler.d.ts.map