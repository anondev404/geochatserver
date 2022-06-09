async function signOut(req, res) {
    req.session = null;

    res.send({
        isSuccess: true,
        message: 'User signed out'
    });

    return;
}

module.exports.signOut = signOut;