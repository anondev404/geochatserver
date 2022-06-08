const { GeoUserHandler } = require('../../../database/table/GeoUser/GeoUserHandler');

const { UserNotFoundException } = require('../../../database/table/GeoUser/exception/GeoUserHandlerException');

async function logOutResolver(req, res) {
    const cred = req.body;

    try {
        let flag = await GeoUserHandler.getHandler().createUser(cred.username, cred.password);

        if (flag === 1) {

            res.send({
                message: 'Account Created'
            });
        } else {
            if (flag === 0) {

                res.send({
                    message: 'Account already exits'
                });
            } else {
                throw new Error('SIGNUP FAILED');
            }
        }
    } catch (err) {
        console.log(err);

        res.send({
            message: 'OOPS! cannot create your account'
        });
    }
}

module.exports.logOutResolver = logOutResolver;