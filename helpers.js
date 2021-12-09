// helper function: check email exists in database
const findUserByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

module.exports = { findUserByEmail };
