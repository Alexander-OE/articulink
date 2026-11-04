import mongoose, { Document, Schema, model } from "mongoose";
const ArticleSchema = new Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    summary: { type: String, default: "" },
    tags: { type: [String], default: [], index: true },
}, { timestamps: true });
// Full-text index powering GET /articles/search
ArticleSchema.index({ title: "text", content: "text", tags: "text" });
export default mongoose.model("Article", ArticleSchema);
//# sourceMappingURL=Article.js.map