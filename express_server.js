const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

// import helper functions
const {
  findUserByEmail,
  generateRandomString,
  authenticateUser,
  urlsForUser,
} = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(cookieSession({
  name: 'session',
  keys: ['5D3D48A41D6A1', 'E4FFB53D66B9A'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));

// temp database object
const urlDatabase = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'user01',
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'user02',
  },
};

// user database
const users = {};

app.get('/', (request, response) => {
  const userID = request.session.user_id;
  if (userID) {
    response.redirect('/urls');
  } else {
    response.redirect('/login');
  }
});

app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

// add post route to receive form submission
app.get('/urls', (request, response) => {
  const userID = request.session.user_id;

  const templateVars = {
    urls: urlsForUser(userID, urlDatabase),
    user: users[userID],
  };
  response.render('urls_index', templateVars);
});

// add route to show url submit form
app.get('/urls/new', (request, response) => {
  const userID = request.session.user_id;
  const templateVars = {
    user: users[userID],
  };
  if (userID) {
    response.render('urls_new', templateVars);
  } else {
    response.redirect('/login');
  }
});

// redirect short urls
app.get('/u/:shortURL', (request, response) => {
  const { longURL } = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

// redirect after form submission
app.post('/urls', (request, response) => {
  const shortURL = generateRandomString();
  const userID = request.session.user_id;
  urlDatabase[shortURL] = {
    longURL: request.body.longURL,
    userID,
  };

  // console.log(request.body); // Log the POST request body to the console
  response.redirect(`/urls/${shortURL}`);
});

// key: request.params.shortURL
// value: urlDatabase[request.params.shortURL]
app.get('/urls/:shortURL', (request, response) => {
  const userID = request.session.user_id;
  const templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL].longURL,
    user: users[userID],
  };
  response.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/delete', (request, response) => {
  const userID = request.session.user_id;
  const {
    shortURL,
  } = request.params;

  // check to see if user can delete urls
  const userURLS = urlsForUser(userID, urlDatabase);
  if (Object.keys(userURLS).includes(shortURL)) {
    delete urlDatabase[shortURL];
    response.redirect('/urls');
  } else {
    response.status(400).send('You do not have permissions to delete urls.');
  }
});

app.post('/urls/:id', (request, response) => {
  const { longURL } = request.body;
  const shortURL = request.params.id;
  const userID = request.session.user_id;

  // check to see if user can edit urls
  const userURLS = urlsForUser(userID, urlDatabase);
  if (Object.keys(userURLS).includes(shortURL)) {
    urlDatabase[shortURL].longURL = longURL;
    response.redirect('/urls');
  } else {
    response.status(400).send('You do not have permissions to edit urls.');
  }
});

// create login page from template
app.get('/login', (request, response) => {
  const userID = request.session.user_id;
  const templateVars = {
    user: users[userID],
  };
  response.render('login', templateVars);
});

// create cookie for login
app.post('/login', (request, response) => {
  const { email } = request.body;
  const { password } = request.body;

  const user = authenticateUser(email, password, users);

  if (user) {
    request.session.user_id = user.id;
    response.redirect('/urls');
    return;
  }
  // user is not authenticated
  response.status(403).send('wrong credentials!');
});

// clear cookie for logout
app.post('/logout', (request, response) => {
  request.session = null;
  response.redirect('/login');
});

// create registration page from template
app.get('/register', (request, response) => {
  const userID = request.session.user_id;
  const templateVars = {
    user: users[userID],
  };
  response.render('register', templateVars);
});

// registration handler
app.post('/register', (request, response) => {
  const userID = generateRandomString();
  const userEmail = request.body.email;
  const userPass = request.body.password;

  const userFound = findUserByEmail(userEmail, users);

  // if email or password is blank send error
  if (userEmail === '' || userPass === '') {
    response.status(400).send('Please fill in all fields.');
  }

  // if email already in database send error
  if (userFound) {
    response.status(400).send('Sorry, a user is already registered with this email.');
    return;
  }

  // create new user in database
  users[userID] = {
    id: userID,
    email: userEmail,
    // hash password
    password: bcrypt.hashSync(userPass, 10),
  };

  // create user id cookie
  request.session.user_id = userID;
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
