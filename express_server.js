const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs") //tells the Express app to use EJS as its templating engine

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

let cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ["CookieSessionTestingForIsabelJansi"],
}))

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const getUserByEmail = require("./helpers");

const bcrypt = require('bcryptjs');

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
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

function generateRandomString() {
  const length = 6;
  const chars = '0abcde1NOPQRST2ABCDEFG345UVWXYZ6ijkltuv7mnopqrs89fghwxyzHIJKLM'
  let result = "";
  for (let i = length; i > 0; --i) 
    result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

//registers a handler on the root path, "/".
app.get("/", (req, res) => { 
  const id = req.session.user_id;
  if(!id){
    return res.redirect('/login');
  } 
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//returns an object with the URLs where the userID is equal to the id of the currently logged-in user
function urlsForUser(id){
  const results ={};
  const keys = Object.keys(urlDatabase); //array
  for(const shortURL of keys){
    const url = urlDatabase[shortURL];

    if(url.userID === id){
      results[shortURL] = url;
    } 
  }
  return results;
}

//lists the urls of the logged in user
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  if(!id){
    res.send(`<h1> Error:400 Please <a href = "http://localhost:8080/login">Login</a> or <a href = "http://localhost:8080/register"> Register</a> a new account.</h1>`);
  } 
  const templateVars = { user: users[id], urls: urlsForUser(id)};
  res.render("urls_index", templateVars);
});

//create new urls page 
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  if(!id){
    return res.send(`<h1> Error:400 Please <a href = "http://localhost:8080/login">Login</a> or <a href = "http://localhost:8080/register"> Register</a> a new account.</h1>`);
  } 
  const templateVars = { users, user: users[id] };
  res.render("urls_new", templateVars);
});

//to get the login.ejs page
app.get('/login', (req, res) => {
  const id = req.session.user_id;
  if(id){
    return res.redirect('/urls');
  } 
  const templateVars = { urls: urlDatabase, user: users[id] };
  res.render('login',templateVars)
});

//To create a new URL entry. Gives the long url a short id and updates the urlDatabase
app.post("/urls", (req, res) => {
  const id = req.session.user_id;
  if(!id){
    return res.send(`<h1> Error:400 Please <a href = "http://localhost:8080/login">Login</a> or <a href = "http://localhost:8080/register"> Register</a> a new account.</h1>`);
  }
  const longURL = req.body.longURL
  const shortURL = generateRandomString(); 
  
  urlDatabase[shortURL] = {longURL: longURL, userID: id}; //adds  the key value pair to the urlDatabase
  res.redirect(`/urls/${shortURL}`);
});

//page of the shortURL
app.get("/u/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const longURL = urlDatabase[req.params.shortURL].longURL
  if(!id){
    return res.redirect(longURL);
  }
  res.redirect(longURL);
});

//to delete a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.user_id;
  if(!id){
    return res.send(`<h1> Error:400 Please <a href = "http://localhost:8080/login">Login</a> or <a href = "http://localhost:8080/register"> Register</a> a new account.</h1>`);
  }
    delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);
});

//gets the page when edit is clicked
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;

  if(!id){
    return res.send(`<h1> Error:400 Please <a href = "http://localhost:8080/login">Login</a> or <a href = "http://localhost:8080/register"> Register</a> a new account.</h1>`);
  }

  // check if the url belongs to the logged in user's database. 
  // if it does not belong to user post a html error page.
 
  if(id !== urlDatabase[req.params.shortURL].userID){
    return res.send(`<h1> Error:400 Please <a href = "http://localhost:8080/login">Login</a> or <a href = "http://localhost:8080/register"> Register</a> a new account.</h1>`);
  }
  const templateVars = { users, user: users[id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

//submitting after editing the link
app.post("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  if(!id){
    return res.send(`<h1> Error:400 Please <a href = "http://localhost:8080/login">Login</a> or <a href = "http://localhost:8080/register"> Register</a> a new account.</h1>`);
  }
  const shortURL = req.params.shortURL
  urlDatabase[shortURL].longURL = req.body.longURL;
  return res.redirect('/urls');
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
   const email = req.body.email;
   const password = req.body.password;

   if(getUserByEmail.getUserByEmail(users, email) === false) {
    return res.send(`<h1> Error:403 User does not exist. Please <a href = "http://localhost:8080/register"> Register</a> </h1>`);
  }

  if(getUserByEmail.getUserByEmail(users, email) === true) {
    const id = getKeyByValue(users, email);
    const user = users[id];
    if(!bcrypt.compareSync(`${password}`, user.password)){
      return res.send(`<h1> Error:400 Password does not match. Please <a href = "http://localhost:8080/login">Login</a> again or <a href = "http://localhost:8080/register"> Register</a> a new account.</h1>`);
    }
    req.session.user_id = id;
    res.redirect(`/urls`);
  }

});


//gets the register page
app.get('/register', (req, res) => {
  const id = req.session.user_id;
  if(id){
    return res.redirect('/login');
  } 
    res.render('register');
});


//posts to the register page
app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const id = userId;
  const email = req.body.email;
  const password = bcrypt.hashSync(`${req.body.password}`, 10);

  if(req.body.password === ""){
    res.send(`<h1> Error:400 Please <a href = "http://localhost:8080/register"> Register</a> with a valid Email and Password.</h1>`);
    return;
  }

  if(email === "" || password === ""){
    res.send(`<h1> Error:400 Please <a href = "http://localhost:8080/register"> Register</a> with a valid Email and Password.</h1>`);
    return;
  }

  const emailFound = getUserByEmail.getUserByEmail(users, email);
  if(emailFound === true){
    return res.send(`<h1> Error:400 User already exists. Please <a href = "http://localhost:8080/login">Login</a> or <a href = "http://localhost:8080/register"> Register</a> with a different Email.</h1>`);
  }
  else {
    users[userId] = {id:id, email:email, password:password};
    req.session.user_id = `${id}`;
    res.redirect('urls');
  }


  //execute the logout and clears the cookies
app.post("/logout", (req, res) => {
  req.session.user_id = null //destroys the cookie
  res.redirect('/login');
});

});

