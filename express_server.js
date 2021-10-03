const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs") //tells the Express app to use EJS as its templating engine

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  const length = 6;
  const chars = '0abcde1NOPQRST2ABCDEFG345UVWXYZ6ijkltuv7mnopqrs89fghwxyzHIJKLM'
  let result = "";
  for (let i = length; i > 0; --i) 
    result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}


app.get("/", (req, res) => { //registers a handler on the root path, "/".
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});




app.get("/urls", (req, res) => {
  const id = req.cookies['user_id']
  // console.log("id: " +id);
  const templateVars = { users, user: users[id], urls: urlDatabase };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies['user_id']
  const templateVars = { users, user: users[id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies['user_id']
  const templateVars = { users, user: users[id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//to get the login.ejs page
app.get('/login', (req, res) => {

  res.render('login');
});

// app.post("/urls", (req, res) => {
//   console.log(req.body);  // Log the POST request body to the console
//   res.send("Ok");         // Respond with 'Ok' (we will replace this)
// });

//To create a new URL entry. Gives the long url a short id and updates the urlDatabase
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL
  const shortURL = generateRandomString(); 
  urlDatabase[shortURL] = longURL; //adds  the key value pair to the urlDatabase
  res.redirect(`/urls/${shortURL}`);
});

//page of the shortURL
app.get("/u/:shortURL", (req, res) => {
  // console.log(req.params);
  // console.log(req.params.shortURL)
  // console.log(urlDatabase[req.params.shortURL]);
  const longURL = urlDatabase[req.params.shortURL]
  //console.log(longURL)
  res.redirect(longURL);
});

//to delete a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  //console.log(req.params.shortURL)
    delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);
});

//gets the page when edit is clicked
app.get("/urls/:shortURL", (req, res) => {
  // console.log(" Foo 5 : " + req.body)
  const id = req.cookies['user_id']
  const templateVars = { users, user: users[id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//submitting after editing the link
app.post("/urls/:shortURL", (req, res) => {
  //console.log(req.body);
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// loops through the nested user object to find the key of the email value
function getKeyByValue(object, email) {
  const nestObject = Object.values(object);
  for(const item of nestObject){
    if(item.email === email) {
      return item.id;
    }
  }
  return false;
}

//logins to the form
app.post("/login", (req, res) => {
   // Insert Login Code Here
   const email = req.body.email;
   const password = req.body.password
    // console.log(" Foo 3 email:" + email)
    // console.log("Foo 4 password: " +password)
  
   if(emailLookUp(email) === false) {
    return res.send(`<h1> Error:403 User does not exist. Please <a href = "http://localhost:8080/register"> Register</a> </h1>`);
  }

  if(emailLookUp(email) === true) {
    const id = getKeyByValue(users, email);
    // console.log("Foo 2 id: " + id);
    const user = users[id];
    if(password !== user.password){
      return res.send(`<h1> Error:400 Password does not match. Please <a href = "http://localhost:8080/login">Login</a> again or <a href = "http://localhost:8080/register"> Register</a> a new account.</h1>`);
    }

    res.cookie("user_id", id);
    res.redirect(`/urls`);
  }
   //res.cookie('username', username)
   //users[id] = {id: id, email: email, password: password}

});



//execute the logout and clears the cookies
app.post("/logout", (req, res) => {
  // Insert Login Code Here
  const email = req.body.email;
  const id = getKeyByValue(users, email);
  //res.clearCookie('username', username)
  res.clearCookie('user_id', id)
  res.redirect(`/urls`);
});

app.get('/register', (req, res) => {

  res.render('register');
});



//posts to the register page
app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const id = userId;
  const email = req.body.email;
  const password = req.body.password;
  //console.log(`id: ${id}, email: ${email}, password: ${password}`)

  if(email === "" || password === ""){
    res.send(`<h1> Error:400 Please <a href = "http://localhost:8080/register"> Register</a> with an Email and Password.</h1>`);
   // res.redirect('/register');
    return;
  }

  const emailFound = emailLookUp(users, email);
  // console.log("Foo 1 emailFound : " +emailFound)

  if(emailFound === true){
    return res.send(`<h1> Error:400 User already exists. Please <a href = "http://localhost:8080/login">Login</a> or <a href = "http://localhost:8080/register"> Register</a> with a different Email.</h1>`);
  }
  else {
    users[userId] = {id:id, email:email, password:password};
    // console.log(users);
    // console.log(users[userId]);
    res.cookie('user_id', id)
    res.redirect('urls');
  }
});

//function to check if email exists in the user database
function emailLookUp(object, email) {
  const nestObject = Object.values(object);
  for (const item of nestObject) {
    if(item.email === email) {
     return true;
    }
  } 
  return false;
}