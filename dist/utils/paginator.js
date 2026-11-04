export function buildPaginationResponse(data, total, limit, offset) {
    return {
        data,
        meta: {
            total,
            limit,
            offset,
        },
    };
}
//# sourceMappingURL=paginator.js.map