const bcrypt = require('bcryptjs');

const findUserByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

const generateRandomString = () => {
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomCharCode = Math.floor(Math.random() * 26 + 97);
    const randomChar = String.fromCharCode(randomCharCode);
    randomString += randomChar;
  }
  return randomString;
};

const authenticateUser = (email, password, db) => {
  const user = findUserByEmail(email, db);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return false;
};

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
