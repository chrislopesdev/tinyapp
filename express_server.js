const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const {
  findUserByEmail,
  generateRandomString,
  authenticateUser,
  urlsForUser,
} = require('./helpers');

const PORT = 8080;
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(cookieSession({
  name: 'session',
  keys: ['5D3D48A41D6A1', 'E4FFB53D66B9A'],

  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));

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

app.get('/register', (request, response) => {
  const userID = request.session.user_id;
  const templateVars = {
    user: users[userID],
  };
  response.render('register', templateVars);
});

app.get('/login', (request, response) => {
  const userID = request.session.user_id;
  const templateVars = {
    user: users[userID],
  };
  response.render('login', templateVars);
});

app.get('/urls', (request, response) => {
  const userID = request.session.user_id;

  const templateVars = {
    urls: urlsForUser(userID, urlDatabase),
    user: users[userID],
  };
  response.render('urls_index', templateVars);
});

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

app.get('/urls/:shortURL', (request, response) => {
  const userID = request.session.user_id;
  const { shortURL } = request.params;
  const userURLS = urlsForUser(userID, urlDatabase);
  const templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL].longURL,
    user: users[userID],
  };

  if (Object.keys(userURLS).includes(shortURL)) {
    response.render('urls_show', templateVars);
  } else {
    response.status(400).send('You do not have permissions to edit urls.');
  }
});

app.get('/u/:shortURL', (request, response) => {
  const { longURL } = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

app.post('/urls', (request, response) => {
  const shortURL = generateRandomString();
  const userID = request.session.user_id;
  if (userID) {
    urlDatabase[shortURL] = {
      longURL: request.body.longURL,
      userID,
    };
    response.redirect(`/urls/${shortURL}`);
  } else {
    response.status(400).send('You must be logged in to create a short URL.');
  }
});

app.post('/urls/:shortURL/delete', (request, response) => {
  const userID = request.session.user_id;
  const {
    shortURL,
  } = request.params;

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

  const userURLS = urlsForUser(userID, urlDatabase);
  if (Object.keys(userURLS).includes(shortURL)) {
    urlDatabase[shortURL].longURL = longURL;
    response.redirect('/urls');
  } else {
    response.status(400).send('You do not have permissions to edit urls.');
  }
});

app.post('/login', (request, response) => {
  const { email } = request.body;
  const { password } = request.body;
  const user = authenticateUser(email, password, users);
  if (user) {
    request.session.user_id = user.id;
    response.redirect('/urls');
    return;
  }
  response.status(403).send('wrong credentials!');
});

app.post('/logout', (request, response) => {
  request.session = null;
  response.redirect('/login');
});

app.post('/register', (request, response) => {
  const userID = generateRandomString();
  const userEmail = request.body.email;
  const userPass = request.body.password;
  const userFound = findUserByEmail(userEmail, users);

  if (userEmail === '' || userPass === '') {
    response.status(400).send('Please fill in all fields.');
  }

  if (userFound) {
    response.status(400).send('Sorry, a user is already registered with this email.');
    return;
  }

  users[userID] = {
    id: userID,
    email: userEmail,
    password: bcrypt.hashSync(userPass, 10),
  };

  request.session.user_id = userID;
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
