import mongoose, { Document } from 'mongoose';
export interface IInteraction extends Document {
    userId: mongoose.Types.ObjectId;
    articleId: mongoose.Types.ObjectId;
    interactionType: 'view' | 'like' | 'share';
    createdAt: Date;
}
declare const _default: mongoose.Model<IInteraction, {}, {}, {}, mongoose.Document<unknown, {}, IInteraction, {}, {}> & IInteraction & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Interaction.d.ts.map