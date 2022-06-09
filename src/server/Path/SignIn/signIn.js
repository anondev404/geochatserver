const { GeoUserHandler } = require('../../../database/table/GeoUserHandler/GeoUserHandler');

const { UserNotFoundException, InvalidCredentials } = require('../../../database/table/GeoUserHandler/GeoUserHandlerException/GeoUserHandlerException');
const { UnknownException } = require('../../../database/table/GlobalDatabaseTableHandlerException/UnknownException');

async function signIn(req, res) {
    const cred = req.body;
    try {
        const geoUserHandler = GeoUserHandler.getHandler();

        const username = await geoUserHandler.validateUser(cred.username, cred.password);

        geoUserHandler.release();

        //saving the username in session data
        req.session.username = cred.username;

        res.send({
            isSuccess: true,
            message: `Welcome to chatserver ${req.session.username}`
        });

    } catch (err) {
        //console.log(err);

        //user to send message does not exits
        if (err instanceof UserNotFoundException) {
            res.send({
                isSuccess: false,
                message: err.message
            });

            return;
        } else if (err instanceof InvalidCredentials) {
            res.send({
                isSuccess: false,
                message: err.message
            });

            return;
        } else {
            res.send({
                isSuccess: false,
                message: 'OOPS! cannot signin'
            });
        }
    }
}

module.exports.signIn = signIn; 