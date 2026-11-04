import type { Request, Response, NextFunction } from "express";
/**
 * Error carrying an HTTP status code. Throw this from controllers to return a
 * specific status (e.g. 404) through the centralized error handler.
 */
export declare class AppError extends Error {
    status: number;
    constructor(message: string, status?: number);
}
export declare function notFound(req: Request, res: Response): void;
export declare function errorHandler(err: Error & {
    status?: number;
}, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=errorHandler.d.ts.map