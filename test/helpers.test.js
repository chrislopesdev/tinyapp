const { assert } = require('chai');

const { findUserByEmail } = require('../helpers');

const testUsers = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

describe('findUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = findUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';
    // Write your assert statement here

    assert(user, expectedUserID);
  });

  it('should return undefined if there is no match', () => {
    const user = findUserByEmail('userzzzz@example.com', testUsers);
    // Write your assert statement here
    assert.equal(user, undefined);
  });

  it('should return undefined if there is no email given', () => {
    const user = findUserByEmail('', testUsers);
    // Write your assert statement here
    assert.equal(user, undefined);
  });
});
