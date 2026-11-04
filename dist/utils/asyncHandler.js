/**
 * Wraps an async route handler so any rejected promise is forwarded to the
 * centralized error-handling middleware instead of crashing the process.
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
//# sourceMappingURL=asyncHandler.js.map