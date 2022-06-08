const _message = "User already exists!";

class UserAlreadyExitsException extends Error {

    constructor() {
        super(_message);
    }
}

module.exports.UserAlreadyExitsException = UserAlreadyExitsException;