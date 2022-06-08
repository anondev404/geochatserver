const { GeoUserHandler } = require('../../../database/table/GeoUserHandler/GeoUserHandler');

const { UserNotFoundException } = require('../../../database/table/GeoUserHandler/GeoUserHandlerException/GeoUserHandlerException');

async function signIn(req, res) {
    const cred = req.body;
    console.log(cred.username);
    try {
        let flag = await GeoUserHandler.getHandler().validateUser(cred.username, cred.password);
        if (flag === 1) {

            //saving the username in session data
            req.session.username = cred.username;

            res.send({
                message: `Welcome to chatserver ${req.session.username}`
            });
        } else {
            if (flag === 0) {

                res.send({
                    message: 'Invalid username or password'
                });
            } else {
                throw new Error('SIGNIN FAILED');
            }
        }
    } catch (err) {
        console.log(err);

        //user to send message does not exits
        if (err instanceof UserNotFoundException) {
            res.send({
                message: err.message
            });
            return;
        }

        res.send({
            message: 'OOPS! cannot signin'
        });
    }
}

module.exports.signIn = signIn; 