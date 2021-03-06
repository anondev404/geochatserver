const { GeoUserHandler } = require('../../../database/table/GeoUserHandler/GeoUserHandler');

const { UserAlreadyExistsException } = require("../../../database/table/GeoUserHandler/GeoUserHandlerException/GeoUserHandlerException");

async function signUp(req, res) {
    const cred = req.body;

    try {
        const geoUserHandler = GeoUserHandler.getHandler();

        await geoUserHandler.createUser(cred.username, cred.password);

        geoUserHandler.release();

        res.send({
            isSuccess: true,
            message: 'Account Created'
        });
    } catch (err) {
        //console.log(err);

        if (err instanceof UserAlreadyExistsException) {
            res.send({
                isSuccess: false,
                message: 'Account already exits'
            });
        } else {
            res.send({
                isSuccess: false,
                message: 'OOPS! cannot create your account'
            });
        }
    }
}

module.exports.signUp = signUp;