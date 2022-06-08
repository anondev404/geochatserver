const { GeoUserHandler } = require('../../../database/table/GeoUserHandler/GeoUserHandler');

const { UserNotFoundException, InvalidCredentials } = require('../../../database/table/GeoUserHandler/GeoUserHandlerException/GeoUserHandlerException');
const { UnknownException } = require('../../../database/table/GlobalDatabaseTableHandlerException/UnknownException');

async function signIn(req, res) {
    const cred = req.body;
    try {
        const username = await GeoUserHandler.getHandler().validateUser(cred.username, cred.password);

        //saving the username in session data
        req.session.username = cred.username;

        res.send({
            message: `Welcome to chatserver ${req.session.username}`
        });

    } catch (err) {
        //console.log(err);

        //user to send message does not exits
        if (err instanceof UserNotFoundException) {
            res.send({
                message: err.message
            });

            return;
        } else if (err instanceof InvalidCredentials) {
            res.send({
                message: err.message
            });

            return;
        } else {
            res.send({
                message: 'OOPS! cannot signin'
            });
        }
    }
}

module.exports.signIn = signIn; 