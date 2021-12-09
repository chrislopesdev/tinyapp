const bcrypt = require('bcryptjs');

// helper function: check email exists in database
const findUserByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

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

// helper function: authenticate user
const authenticateUser = (email, password, db) => {
  // get user object
  const user = findUserByEmail(email, db);

  // check that passwords match => return user object
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return false;
};

// helper function: user urls object
const urlsForUser = (id, urlDatabase) => {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

module.exports = {
  findUserByEmail,
  generateRandomString,
  authenticateUser,
  urlsForUser,
};
