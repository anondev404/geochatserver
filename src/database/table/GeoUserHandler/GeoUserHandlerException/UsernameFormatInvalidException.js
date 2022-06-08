const _message = "Username format is invalid.";
class UsernameFormatInvalidException extends Error {
    constructor() {
        super(_message);
    }
}

module.exports.UsernameFormatInvalidException = UsernameFormatInvalidException;