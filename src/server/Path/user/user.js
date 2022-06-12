const { GeoUserHandler } = require("../../../database/table/GeoUserHandler/GeoUserHandler");
const { UserNotFoundException } = require("../../../database/table/GeoUserHandler/GeoUserHandlerException/UserNotFoundException");


async function fetchUsernameByUserId(httpRequest, httpResponse) {
    let handler;
    try {
        handler = new GeoUserHandler();
        try {
            const username = await handler.getUsername(httpRequest.body.user_id);
            httpResponse.send({
                isFatal: false,
                isExists: true,
                username: username
            });
        } catch (err) {
            if (err instanceof UserNotFoundException) {
                httpResponse.send({
                    isFatal: false,
                    ...err
                });
            }

            httpResponse.send({
                isFatal: true,
                message: 'OOPS! could react the server',

            });
        }
    } catch (err) {
        httpResponse.send({
            isFatal: true,
            message: 'OOPS! server-database down',
            err: err
        })
    } finally {
        if (handler) {
            await handler.realse();
        }
    }
}

module.exports.fetchUsernameByUserId = fetchUsernameByUserId;