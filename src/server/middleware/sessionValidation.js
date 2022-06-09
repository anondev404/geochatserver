//checks if user has an active session
const sessionValidation = (req, res, next) => {
    /*next();
    return;*/

    if (req.session.username) {
        next();
        return;
    }

    res.send({
        message: 'User not recognized. Please signin.'
    });
}

module.exports.sessionValidation = sessionValidation;