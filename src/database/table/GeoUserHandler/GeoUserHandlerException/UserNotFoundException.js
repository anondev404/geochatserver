const _message = "User does not exits";

class UserNotFoundException extends Error {

    constructor() {
        super(_message);
    }
}

module.exports.UserNotFoundException = UserNotFoundException;