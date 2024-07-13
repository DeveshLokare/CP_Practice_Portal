import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
    });

app.get("/", (req, res) => { 
    res.render("index.ejs");
    });

app.post('/login', (req, res) => {
    const User = req.body["login_username"];
    const Password = req.body["login_password"]
    
    res.render("index.ejs", {
     username: User,
     password: Password,
    })
      });

app.post('/signup', (req, res) => {
    const User = req.body["signup_username"];
    const Email = req.body["signup_email"];
    const Password = req.body["signup_password"];
    res.render("index.ejs", {
     username: User,
     password: Password,
     email: Email 
     })

     
    
  });
 //To get problems
  async function fetchProblems() {
    try {
        const response = await axios.get(`https://codeforces.com/api/problemset.problems`);
        const problems = response.data.result.problems;
        return problems;
    } catch (error) {
        console.error('Failed to fetch problems:', error);
        return [];
    }
}
//To get random problems
function getRandomProblem(problems) {
  const randomIndex = Math.floor(Math.random() * problems.length);
  return problems[randomIndex];
}

app.get("/problems", async (req, res) => { 
    const problems = await fetchProblems();
    res.render("problems.ejs", {problems});
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
        const response = await axios.get(`https://codeforces.com/api/contest.list`);
        const contests = response.data.result;
        return contests;
    }catch(error) {
        console.error(`Failed to fetch contests:`, error);
        return [];
    }
}

async function contests() {
    const contests = await fetchContests();
    if (contests.length>0) {
        console.log 
    }
}



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    });











