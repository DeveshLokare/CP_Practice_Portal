import express from "express";
import pasth  from "path";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const app = express();
const collection = mongoose.connection.collection("data");

app.use(express.json());
app.use(express.urlencoded({extended: false}));


app.set('view engine','ejs');
app.use(express.static("public"));

app.get("/",(req, res) => {
    res.render("public/login");
})

app.get("/signup",(req, res) => {
    res.render("public/login");
})

app.post("/signup", async(req, res) => {
    const data = {
        name: req.body.signup_name,
        email: req.body.signup_email,
        password: req.body.signup_password
    }
    const existinguser = await collection.findOne({signup_name: data.signup_name});
    if(existinguser){
        res.send("User already exists. Please choose a different username.");
    }
    else{
    const userdata = await collection.insertMany(data);
    console.log(userdata);
    }
})

app.post("/login", async(req, res) => {
    try{
        const check = await collection.findOne({name: req.body.signup_name});
        if(!check){
            res.send("Username cannot be found")
        }
        const isPasswordMatch = await bcrypt.compare(req.body.signup_password, check.password);
        if (!isPasswordMatch) {
            res.send("wrong Password");
        }
        else {
            res.render("home");
        }

    }
    catch {
        res.send("wrong Details");
    }

});

const port = 5000;
app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
})
