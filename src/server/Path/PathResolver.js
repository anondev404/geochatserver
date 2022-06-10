const { signIn } = require('./SignIn/signIn');
const { signUp } = require('./SignUp/signUp');
const { signOut } = require('./SignOut/signOut');
const { createTopic, fetchTopic } = require('./Topic/Topic');
const { fetchSubTopic, createSubTopic } = require('./SubTopic/SubTopic');

module.exports.signIn = signIn;
module.exports.signUp = signUp;
module.exports.signOut = signOut;

module.exports.createTopic = createTopic;
module.exports.fetchTopic = fetchTopic;

module.exports.createSubTopic = createSubTopic;
module.exports.fetchSubTopic = fetchSubTopic;
