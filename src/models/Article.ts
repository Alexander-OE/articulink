import mongoose, { Document, Schema, model } from "mongoose";

export interface IArticle extends Document {
  title: string;
  content: string;
  author: string;
  summary?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    summary: { type: String, default: "" },
    tags: { type: [String], default: [], index: true },
  },
  { timestamps: true }
);

// Full-text index powering GET /articles/search
ArticleSchema.index({ title: "text", content: "text", tags: "text" });

export default mongoose.model<IArticle>("Article", ArticleSchema);
