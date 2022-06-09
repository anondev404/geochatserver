const { signIn } = require('./SignIn/signIn');
const { signUp } = require('./SignUp/signUp');
const { signOut } = require('./SignOut/signOut');
const { createTopic } = require('./Topic/Topic');
const { fetchTopic } = require('./Topic/Topic');

module.exports.signIn = signIn;
module.exports.signUp = signUp;
module.exports.signOut = signOut;
module.exports.createTopic = createTopic;
module.exports.fetchTopic = fetchTopic;