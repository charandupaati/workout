var express = require("express");
var mysql = require("mysql");
var bcrypt = require("bcryptjs");
var app = express();

const path = require('path');
const publicDirectory = path.join(__dirname, 'public');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDirectory));

var pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root", 
  database: "mydb17",
  connectionLimit: 10, 
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database.");
    connection.release(); 
  }
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signin.html");
});

app.get("/login", (req, res) => {
  res.redirect("/login.html");
});


app.get("/login.html", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.get("/homepage.html", (req, res) => {
  res.sendFile(__dirname + "/homepage.html");  // Serve the homepage HTML
});

// Serve workout page
app.get("/workout.html", (req, res) => {
  res.sendFile(__dirname + "/workout.html");  // Serve the homepage HTML
});

app.get("/nutrition.html", (req, res) => {
  res.sendFile(__dirname + "/nutrition.html");  // Serve the homepage HTML
});

app.get("/steptracker.html", (req, res) => {
  res.sendFile(__dirname + "/steptracker.html");  // Serve the homepage HTML
});

app.get("/breakfast.html", (req, res) => {
  res.sendFile(__dirname + "/breakfast.html");  // Serve the homepage HTML
});

app.get("/lunch.html", (req, res) => {
  res.sendFile(__dirname + "/lunch.html");  // Serve the homepage HTML
});

app.get("/snacks.html", (req, res) => {
  res.sendFile(__dirname + "/snacks.html");  // Serve the homepage HTML
});

app.get("/dinner.html", (req, res) => {
  res.sendFile(__dirname + "/dinner.html");  // Serve the homepage HTML
});

app.post("/reg", (req, res) => {
  var uname = req.body.uname;
  var email = req.body.email;
  var pwd = req.body.pwd;
  var cpwd = req.body.cpwd;

  if (pwd !== cpwd) {
    return res.status(400).send("Passwords do not match.");
  }

  bcrypt.hash(pwd, 10, (err, hashedPwd) => {
    if (err) {
      return res.status(500).send("Error hashing password.");
    }

    pool.query("INSERT INTO studentinfo (uname, email, pwd) VALUES (?, ?, ?)", 
           [uname, email.trim().toLowerCase(), hashedPwd],
      function (err, result, fields) {
        if (err) {
          console.error("Error executing query:", this.sql); 
          console.error("Database Error Details:", err); 
          return res.status(500).send("Error saving user to the database.");
        }
        res.redirect("/login");
      }
    );
  });
});



app.post("/auth", (req, res) => {
  console.log("Request received at /auth with data:", req.body);

  var email = req.body.email.trim().toLowerCase(); 
  var pwd = req.body.pwd;

  pool.query(
    "SELECT * FROM studentinfo WHERE email = ?",
    [email],
    function (err, result, fields) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Error querying database.");
      }

      if (result.length > 0) {
        console.log("User found:", result[0]); // Log retrieved user details
        bcrypt.compare(pwd, result[0].pwd, (err, isMatch) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return res.status(500).send("Error comparing passwords.");
          }

          if (isMatch) {
            console.log("Login successful for user:", email);
            res.sendFile(__dirname + "/homepage.html");
          } else {
            console.log("Invalid password for user:", email);
            res.status(401).send("Invalid username or password.");
          }
        });
      } else {
        console.log("User not found in database:", email);
        res.status(404).send("User not found.");
      }
    }
  );
});

app.listen(8088, () => {
  console.log("Server running on port 8088");
});