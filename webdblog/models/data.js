import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    favourites: {
        type: [String],
        default: []
    },
    streak: {
         type: Number, 
         default: 0
    },
    solvedProblems: {
        type: [String],
    },
    lastSolvedDate: Date,
});

export const collection = mongoose.model("signup", userSchema);




