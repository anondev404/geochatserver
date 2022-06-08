const { UserNotFoundException } = require('./UserNotFoundException');
const { UserAlreadyExistsException } = require('./UserAlreadyExistsException');
const { InvalidCredentials } = require('./InvalidCredentials');

module.exports.UserNotFoundException = UserNotFoundException;
module.exports.UserAlreadyExistsException = UserAlreadyExistsException;
module.exports.InvalidCredentials = InvalidCredentials;