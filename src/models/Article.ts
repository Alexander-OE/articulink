import mongoose, { Document, Schema, model } from "mongoose";

export interface IArticle extends Document {
  title: string;
  content: string;
  author: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    summary: { type: String, default: "" },
  },
  { timestamps: true }
);

ArticleSchema.index({ title: "text", content: "text" });

export default mongoose.model<IArticle>("Article", ArticleSchema);
