const _message = "Reason not known!";

class UnknownException extends Error {
    _err;

    constructor(err) {
        this._err = err;
        super();
    }
}

module.exports.UnknownException = UnknownException;