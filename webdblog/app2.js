import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import axios from "axios";
import { dirname } from "path";
import { collection } from "./models/data.js";
import { fileURLToPath } from "url";
import { request } from "http";
import { env } from "process";
import { differenceInDays } from "date-fns"; 
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
mongoose.connect("mongodb://localhost:27017/cpPortal", {})
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Failed to connect to database", err);
  });

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));


let currentUser = null ;
let email=null;
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
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
      
      app.post('/login', async (req, res) => {
        const { login_username, login_password } = req.body;
      
        try {
          const user = await collection.findOne({ username: login_username, password: login_password });
          if (user) {
            currentUser = login_username;
            res.render("index.ejs", { data: { username: login_username, password: login_password, email: user.email } });
          } else {
            res.status(400).send("Invalid username or password");
          }
        } catch (err) {
          console.error("Error during login:", err);
          res.status(500).send("Internal Server Error");
        }
      });

   
        
    app.get("/editprofile", (req, res) => { 
            res.render("editprofile.ejs",{
                username : currentUser
            });
            });
            app.post('/editprofile', (req, res) => {
                const newUsername = req.body.new_username;
                const newPassword = req.body.new_password;
               
                currentUser = newUsername;
                res.render('index.ejs',
                   { username : currentUser,
                    email
              });
              });

        app.get("/profile", (req, res) => { 
             const email = req.body["signup_email"];
            res.render("index.ejs",{
                    username : currentUser,
                    email : email
                });
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
async function fetchcount() {
    try {
const response2 = await axios.get(`https://codeforces.com/api/problemset.problems?tags=<tag_name>`)
const solvedCount = response2.data.result.problems;
return solvedCount;
} catch (error) {
    console.error('Failed to fetch problems:', error);
    return [];
}};

app.get("/problems", async (req, res) => { 
    const page = parseInt(req.query.page) || 1; 
    const pageSize = 30;
    
    const problems = await fetchProblems();
    let filteredProblems = problems;
    const minRating = parseInt(req.query.minRating);
    const maxRating = parseInt(req.query.maxRating);

    if (!isNaN(minRating)) {
        filteredProblems = filteredProblems.filter(problems => problems.rating >= minRating);
    }
    if (!isNaN(maxRating)) {
        filteredProblems = filteredProblems.filter(problems => problems.rating <= maxRating);
    }
   
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProblems = filteredProblems.slice(startIndex, endIndex);
    
    res.render("problems.ejs", {
        problems: paginatedProblems,
        username: currentUser,
        currentPage: page,
        totalPages: Math.ceil(filteredProblems.length / pageSize),
        minRating: minRating || '',
        maxRating: maxRating || ''  
    });
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
  return randomProblem;
}


app.get("/home", async (req,res) => {
  const  randomProblem = await random();
    res.render("home.ejs",{ randomProblem , username: currentUser});
});


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
import { google } from 'googleapis';

const calendar = google.calendar('v3');

async function createEvent(auth) {
    const event = {
        summary: 'Event Title',
        location: 'Location',
        description: 'Description of the event',
        start: {
            dateTime: '2024-08-01T10:00:00-07:00', 
            timeZone: 'America/Los_Angeles',
        },
        end: {
            dateTime: '2024-08-01T11:00:00-07:00',
            timeZone: 'America/Los_Angeles',
        },
        attendees: [
            { email: 'example@example.com' },
        ],
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 10 },
            ],
        },
    };

    try {
        const response = await calendar.events.insert({
            auth,
            calendarId: 'primary',
            resource: event,
        });
        console.log('Event created:', response.data.htmlLink);
    } catch (error) {
        console.error('Error creating event:', error);
    }
}

app.get("/contests", async (req, res) => {
    const page = parseInt(req.query.page) || 1; 
    const pageSize = 20;

    const contests = await fetchContests();

    const totalContests = contests.length;
    const totalPages = Math.ceil(totalContests / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedContests = contests.slice(startIndex, endIndex);

    res.render("contests.ejs", {
        contests: paginatedContests,
        username: currentUser,
        currentPage: page,
        totalPages: totalPages
    });
});

async function contests() {
    const contests = await fetchContests();
    if (contests.length>0) {
        console.log 
    }
}
async function getNumberOfProblemsSolved(login_username) {
    try {

const response = await axios.get(`https://codeforces.com/api/user.status?handle=${login_username}}`);
       
    const submissions = response.data.result;
    const solvedProblems = new Set();
    
   
    submissions.forEach(submission => {
        if (submission.verdict === 'OK') {
            const problemId = `${submission.problem.contestId}${submission.problem.index}`;
            solvedProblems.add(problemId);
        }
        return solvedProblems.size;
    });

  
}

catch (error) {
console.error('Error fetching data:', error.message);
throw error;
}
}
let Count =0 ;
app.get('/signup', async (req, res) => {
try {
const Count = await getNumberOfProblemsSolved(signup_username);
res.render("index.ejs", {
    Count : Count}); 
} catch (error) {
console.error('Failed to get number of problems solved:', error.message);
res.status(500).send('Failed to get number of problems solved');
}
});
   app.post('/home', async (req, res) => {
        const User = req.body["signup_username"];
        const Email = req.body["signup_email"];
        const Password = req.body["signup_password"];
        currentUser = User;
       const randomProblem= await random();
        email=Email
        res.render("home.ejs",{
         username: User,
         password: Password,
         email: Email ,
         randomProblem
         }
        )});
        // Add a problem to favourites
app.post('/addFavourite', async (req, res) => {
    const { username, problemId } = req.body;
  
    try {
      const user = await collection.findOne({ username });
  
      await collection.updateOne(
        { username },
        { $addToSet: { favourites: problemId } }
      );
  
      res.redirect('/favourites');
    } catch (err) {
      console.error("Error adding favourite:", err);
      res.status(500).send("Internal Server Error");
    }
  });
  
  // Remove a problem from favorites
  app.post('/removeFavourite', async (req, res) => {
    const { username, problemId } = req.body;
  
    try {
      await collection.updateOne(
        { username },
        { $pull: { favourites: problemId } }
      );
      res.status(200).send("Removed from favourites");
    } catch (err) {
      console.error("Error removing favourite:", err);
      res.status(500).send("Internal Server Error");
    }
  });
  
  // Get the list of favourite problems for the current user
  app.get('/favourites', async (req, res) => {
    try {
      const user = await collection.findOne({ username: currentUser });
      const favouriteProblems = user ? user.favourites : [];
   
      res.render('favourites.ejs', { favourites: favouriteProblems, username: currentUser});
    } catch (err) {
      console.error("Error fetching favourites:", err);
      res.status(500).send("Internal Server Error");
    }
  });
  
  // Handle problem solving and streak updates
  app.post('/solveProblem', async (req, res) => {
    const { username, problemId, solved } = req.body;
  
    try {
      const user = await collection.findOne({ username });
  
      if (!user) {
        return res.status(404).send("User not found");
      }
  
      const today = new Date();
      let newStreak = user.streak;
  
      if (user.lastSolvedDate) {
        const diffDays = differenceInDays(today, user.lastSolvedDate);
        if (diffDays === 1) {
          newStreak += 1; // Increment streak if solved the next day
        } else if (diffDays > 1) {
          newStreak = 1; // Reset streak if there’s a gap
        }
      } else {
        newStreak = 1; // First solve
      }
  
      const updateData = {
        lastSolvedDate: today,
        streak: newStreak,
        $addToSet: { solvedProblems: problemId }
      };
      console.log(solvedProblems.length());
  
      await collection.updateOne({ username }, updateData);
      //res.render("problems.ejs", {user});
      //res.redirect('/problems'); // Redirect back to problems page
    } catch (err) {
      console.error("Error updating problem status:", err);
      res.status(500).send("Internal Server Error");
    }
  });
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    });