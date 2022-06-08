const { signIn } = require('./SignIn/signIn');
const { signUp } = require('./SignUp/signUp');
const { signOut } = require('./SignOut/signOut');

module.exports.signIn = signIn;
module.exports.signUp = signUp;
module.exports.signOut = signOut;