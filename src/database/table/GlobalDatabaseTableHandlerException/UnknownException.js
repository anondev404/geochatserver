const _message = "Reason not known!";

class UnknownException extends Error {
    _err;

    constructor(err) {
        super();
        this._err = err;
    }
}

module.exports.UnknownException = UnknownException;