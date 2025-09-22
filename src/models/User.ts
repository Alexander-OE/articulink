import mongoose, { Schema, Document } from 'mongoose';


export interface IUser extends Document {
username: string;
interests?: string[];
createdAt: Date;
}


const UserSchema: Schema = new Schema(
{
username: { type: String, required: true, unique: true, trim: true },
interests: { type: [String], default: [] },
},
{ timestamps: true }
);


export default mongoose.model<IUser>('User', UserSchema);