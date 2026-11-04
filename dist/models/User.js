import mongoose, { Schema, Document } from "mongoose";
const UserSchema = new Schema({
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    // Always stored in lowercase so "Ada@X.com" and "ada@x.com" are the same account.
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    // select: false keeps the hash out of every query unless it is asked for
    // explicitly with .select("+passwordHash") (only the login code does that).
    passwordHash: { type: String, required: true, select: false },
    interests: { type: [String], default: [] },
}, {
    timestamps: true,
    toJSON: {
        // Second safety net: even if a hash is loaded, it is removed from any JSON response.
        transform: (_document, plainObject) => {
            delete plainObject.passwordHash;
            return plainObject;
        },
    },
});
export default mongoose.model("User", UserSchema);
//# sourceMappingURL=User.js.map