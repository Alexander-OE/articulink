import mongoose, { Schema, Document } from 'mongoose';
const InteractionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    interactionType: { type: String, enum: ['view', 'like', 'share'], required: true },
}, { timestamps: true });
export default mongoose.model('Interaction', InteractionSchema);
//# sourceMappingURL=Interaction.js.map