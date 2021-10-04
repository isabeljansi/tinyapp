//function to check if email exists in the user database
const getUserByEmail = function(users, email) {
  const nestObject = Object.values(users);
  for (const item of nestObject) {
    if(item.email === email) {
     return true;
    }
  } 
  return false;
}


module.exports = { getUserByEmail };