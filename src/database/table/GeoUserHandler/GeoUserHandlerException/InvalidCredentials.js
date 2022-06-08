const _message = "Invalid Credentails";
class InvalidCredentials extends Error {
    constructor() {
        super(_message);
    }
}

module.exports.InvalidCredentials = InvalidCredentials;