const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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
};

//if user exists return true
describe('getUserByEmail', function() {
  it('should return true or false', function() {
    const user = getUserByEmail(testUsers, "user@example.com")
    const expectedOutput = true;
    assert.equal(user, expectedOutput);

  });
});

//return true or false for undefined values
describe('getUserByEmail', function() {
  it('should return true or false for undefined emails', function() {
    const user = getUserByEmail(testUsers, "")
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});