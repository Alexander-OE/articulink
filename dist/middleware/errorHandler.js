/**
 * Error carrying an HTTP status code. Throw this from controllers to return a
 * specific status (e.g. 404) through the centralized error handler.
 */
export class AppError extends Error {
    status;
    constructor(message, status = 500) {
        super(message);
        this.status = status;
        this.name = "AppError";
    }
}
// Catch-all for unmatched routes.
export function notFound(req, res) {
    res.status(404).json({ error: "route_not_found", path: req.originalUrl });
}
// Centralized error handler. Must be registered last, after all routes.
export function errorHandler(err, _req, res, 
// Express identifies error handlers by their 4-arg signature, so `next`
// must stay in the list even though it is unused here.
_next) {
    const status = err.status ?? 500;
    // Log the full error for server-side faults; client errors stay quiet.
    if (status >= 500)
        console.error(err);
    res.status(status).json({
        error: status >= 500 ? "internal_server_error" : err.message,
    });
}
//# sourceMappingURL=errorHandler.js.map