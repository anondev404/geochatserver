async function signOut(req, res) {
    req.session = null;

    res.send({
        message: 'User signed out'
    });
}

module.exports.signOut = signOut;