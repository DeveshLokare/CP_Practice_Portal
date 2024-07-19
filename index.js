import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import axios from "axios";
import { collection } from "./models/data.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

let currentUser = null;

mongoose.connect("mongodb://localhost:27017/cpPortal", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
})
.then(() => {
  console.log("Database connected successfully");
})
.catch((err) => {
  console.error("Failed to connect to database", err);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

app.post('/login', async (req, res) => {
  const { login_username, login_password } = req.body;

  try {
    const user = await collection.findOne({ username: login_username, password: login_password });
    if (user) {
      currentUser = username;
      res.render("index.ejs", { data: { username: login_username, password: login_password } });
    } else {
      res.status(400).send("Invalid username or password");
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/signup', async (req, res) => {
  const { signup_username, signup_email, signup_password } = req.body;

  if (!signup_username || !signup_email || !signup_password) {
    return res.status(400).send("All fields are required");
  }

  const data = {
    username: signup_username,
    email: signup_email,
    password: signup_password
  };

  try {
    await collection.insertMany([data]);
    currentUser = signup_username;
    res.render("index.ejs", { data });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/profile", (req, res) => {
  res.render("index.ejs", { username: currentUser });
});

async function fetchProblems() {
  try {
    const response = await axios.get("https://codeforces.com/api/problemset.problems");
    const problems = response.data.result.problems;
    return problems;
  } catch (error) {
    console.error('Failed to fetch problems:', error);
    return [];
  }
}

function getRandomProblem(problems) {
  const randomIndex = Math.floor(Math.random() * problems.length);
  return problems[randomIndex];
}

app.get("/problems", async (req, res) => {
  const problems = await fetchProblems();
  res.render("problems.ejs", { problems, username: currentUser });
});

async function random() {
  const problems = await fetchProblems();
  const randomProblem = getRandomProblem(problems);
  if (randomProblem) {
    console.log(`Random Problem: ${randomProblem.name}`);
    console.log(`Problem URL: https://codeforces.com/problemset/problem/${randomProblem.contestId}/${randomProblem.index}`);
  } else {
    console.log('No problems found.');
  }
}
random();

async function fetchContests() {
  try {
    const response = await axios.get("https://codeforces.com/api/contest.list");
    const contests = response.data.result;
    return contests;
  } catch (error) {
    console.error('Failed to fetch contests:', error);
    return [];
  }
}

app.get("/contests", async (req, res) => {
  const contests = await fetchContests();
  res.render("contests.ejs", { contests, username: currentUser });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
