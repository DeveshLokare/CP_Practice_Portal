import mongoose from "mongoose"
import express from "express"

let a = await mongoose.connect("mongodb://localhost:27017/login")

a.then(() => {
    console.log("Database connected successfully");
})

const LoginSchema = new mongoose.Schema({
    login_name: {
        type: String,
        required: true
    },
    login_password: {
        type: String,
        required: true
    },
    email: {
        type: String
    }
});
const collection = new mongoose.model("users", Loginschema);

module.exports = collection;


