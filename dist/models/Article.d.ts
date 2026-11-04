import mongoose, { Document } from "mongoose";
export interface IArticle extends Document {
    title: string;
    content: string;
    author: string;
    summary?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IArticle, {}, {}, {}, mongoose.Document<unknown, {}, IArticle, {}, {}> & IArticle & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Article.d.ts.map