import mongoose, { Schema, Document } from 'mongoose';


export interface IInteraction extends Document {
userId: mongoose.Types.ObjectId;
articleId: mongoose.Types.ObjectId;
interactionType: 'view' | 'like' | 'share';
createdAt: Date;
}


const InteractionSchema: Schema = new Schema(
{
userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
interactionType: { type: String, enum: ['view', 'like', 'share'], required: true },
},
{ timestamps: true }
);



export default mongoose.model<IInteraction>('Interaction', InteractionSchema);