const _message = "User already exists!";

class UserAlreadyExistsException extends Error {

    constructor() {
        super(_message);
    }
}

module.exports.UserAlreadyExistsException = UserAlreadyExistsException;