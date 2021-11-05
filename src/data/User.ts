import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    email: string;
    passwordHash: string;
}

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true,
        select: false
    }
})

const User = mongoose.model<IUser>("User", schema);

export default User;