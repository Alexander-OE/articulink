import type { Request } from "express";
import { type IUser } from "../models/User.js";
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}
export declare const requireAuth: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare function getAuthenticatedUser(request: Request): IUser;
//# sourceMappingURL=auth.d.ts.map