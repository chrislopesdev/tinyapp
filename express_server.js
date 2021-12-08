const express = require('express');
const bodyParser = require('body-parser');

const app = express();
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

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// add post route to receive form submission
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// add route to show url submit form
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// redirect short urls
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// redirect after form submission
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);
});

// key: req.params.shortURL
// value: urlDatabase[req.params.shortURL]
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  console.log('delete route');
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const { longURL } = req.body;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
