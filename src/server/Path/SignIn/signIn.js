const { GeoUserHandler } = require('../../../database/table/GeoUserHandler/GeoUserHandler');

const { UserNotFoundException, InvalidCredentials } = require('../../../database/table/GeoUserHandler/GeoUserHandlerException/GeoUserHandlerException');
const { UnknownException } = require('../../../database/table/GlobalDatabaseTableHandlerException/UnknownException');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * 
 * coordinate in location is optional. it needs to passed if geoPointPlusCode is not passed
 * req body:{
 * useraname: ''
 * password: ''
 * location:{
 * geoPointPlusCode: plus code of coordinate
 * coordinate:{
 * lat: lattitude
 * lon: longitude
 * }
 * }
 * }
 * 
 * @returns 
 */
async function signIn(req, res) {
    const info = req.body;
    console.log(info.location);
    try {
        const geoUserHandler = GeoUserHandler.getHandler();

        const username = await geoUserHandler.validateUser(info.username, info.password);

        geoUserHandler.release();

        //saving the username in session data
        req.session.username = info.username;

        req.session.location = info.location;

        res.send({
            isSuccess: true,
            message: `Welcome to chatserver ${req.session.username}`
        });

    } catch (err) {
        console.log(err);

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