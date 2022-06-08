const _usernameFormatInvalidMessage = "Username format is invalid.";
class UsernameFormatInvalidException extends Error {
    constructor() {
        super(_usernameFormatInvalidMessage);
    }
}

module.exports.UsernameFormatInvalidException = UsernameFormatInvalidException;