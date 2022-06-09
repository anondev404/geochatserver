async function signOut(req, res) {
    if (req.session.username) {
        req.session = null;

        res.send({
            isSuccess: true,
            message: 'User signed out'
        });

        return;
    }

    res.send({
        isSuccess: false,
        message: "User unidentified!"
    })
}

module.exports.signOut = signOut;