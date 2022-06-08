const { UserNotFoundException } = require('./UserNotFoundException');
const { UserAlreadyExistsException } = require('./UserAlreadyExistsException');

module.exports.UserNotFoundException = UserNotFoundException;
module.exports.UserAlreadyExistsException = UserAlreadyExistsException;