const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// generate random string for short url
const generateRandomString = () => {
  let randomString = '';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 6; i++) {
    const randomCharCode = Math.floor(Math.random() * 26 + 97);
    const randomChar = String.fromCharCode(randomCharCode);
    randomString += randomChar;
  }
  return randomString;
};

// temp database object
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

// add post route to receive form submission
app.get('/urls', (request, response) => {
  const templateVars = {
    urls: urlDatabase,
    username: request.cookies.username,
  };
  response.render('urls_index', templateVars);
});

// add route to show url submit form
app.get('/urls/new', (request, response) => {
  const templateVars = { username: request.cookies.username };
  response.render('urls_new', templateVars);
});

// redirect short urls
app.get('/u/:shortURL', (request, response) => {
  const longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

// redirect after form submission
app.post('/urls', (request, response) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = request.body.longURL;
  console.log(request.body); // Log the POST request body to the console
  response.redirect(`/urls/${shortURL}`);
});

// key: request.params.shortURL
// value: urlDatabase[request.params.shortURL]
app.get('/urls/:shortURL', (request, response) => {
  const templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL],
    username: request.cookies.username,
  };
  response.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/delete', (request, response) => {
  console.log('delete route');
  const { shortURL } = request.params;
  delete urlDatabase[shortURL];
  response.redirect('/urls');
});

app.post('/urls/:id', (request, response) => {
  const { longURL } = request.body;
  const shortURL = request.params.id;
  urlDatabase[shortURL] = longURL;
  response.redirect('/urls');
});

// create cookie for login
app.post('/login', (request, response) => {
  const { username } = request.body;
  response.cookie('username', username);
  response.redirect('/urls');
});

// clear cookie for logout
app.post('/logout', (request, response) => {
  response.clearCookie('username');
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
