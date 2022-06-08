const { GeoUserHandler } = require('../../../database/table/GeoUserHandler/GeoUserHandler');

const { UserAlreadyExistsException } = require("../../../database/table/GeoUserHandler/GeoUserHandlerException/GeoUserHandlerException");

async function signUp(req, res) {
    const cred = req.body;

    try {
        let flag = await GeoUserHandler.getHandler().createUser(cred.username, cred.password);

        res.send({
            message: 'Account Created'
        });
    } catch (err) {
        console.log(err);

        if (err instanceof UserAlreadyExistsException) {
            res.send({
                message: 'Account already exits'
            });
        }

        res.send({
            message: 'OOPS! cannot create your account'
        });
    }
}

module.exports.signUp = signUp;