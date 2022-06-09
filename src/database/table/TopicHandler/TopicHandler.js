const { DatabaseHandler } = require('../../DatabaseHandler');

const { GeoPointHandler } = require('../GeoPointHandler/GeoPointHandler');

const { databaseConfig } = require('../../Config');

//TODO: exception handling
class TopicHandler {
    _databaseHandler;

    _topicTitle;
    _geoPointPlusCode;

    //geoPointPlusCode is main GEOPOINT coordinate plus_code from database
    constructor(topicTitle, geoPointPlusCode) {
        this._topicTitle = topicTitle;
        this._geoPointPlusCode = geoPointPlusCode;
    }


    static getHandler() {
        return new UserHandler();
    }


    async _getDatabaseHandler() {
        if (this._databaseHandler) {

            console.log(this._databaseHandler.isConnectionOpen);

            if (this._databaseHandler.isConnectionOpen) {
                return this._databaseHandler;
            }
        }

        //calling handler opens new connection to the database
        this._databaseHandler = await DatabaseHandler.getHandler();

        return this._databaseHandler;
    }

    async _table() {
        //gets GEOPOINT table from database
        const dHandler = await this._getDatabaseHandler();

        return await dHandler.schema.getTable(databaseConfig.schema.table.TOPIC);
    }

    async settleGeoPointPLusCode(lattitude, longitude) {
        if (this._geoPointPlusCode) {
            let isPlusCodeExists = await GeoPointHandler.checkIfGeoPointExistsWithPlusCode(this._geoPointPlusCode);

            if (!isPlusCodeExists) {
                if (lattitude && longitude) {

                    const geoPointHandler = await GeoPointHandler(lattitude, longitude);
                    const nearestCoor = await geoPointHandler.createGeoPoint();

                    this._geoPointPlusCode = nearestCoor[0];
                } else {
                    console.log('TopicHandler: createTopic(lattitude, longitude) ---> COULD NOT CREATE TOPIC');

                    //topic could not be created as plusCode did not match in database
                    //lattitude and longitutde is not supplied either
                    return -1;
                }
            }
        }

        //geoPoint is settled either by verifying or fetching it from database
        return 1;
    }

    //topic can be created by passing the plusCode(coordinate) nearest to user fetched from database
    //or passing the location lattitude, longitude 
    async createTopic(lattitude, longitude) {
        const isGeoPointPlusCodeSettled = await this.settleGeoPointPLusCode(lattitude, longitude);

        //GeoPoint settled
        if (isGeoPointPlusCodeSettled === 1) {
            let geoPointTable = await this._table();

            const dHandler = await this._getDatabaseHandler();

            await dHandler.session.startTransaction();

            const sqlRes = await geoPointTable
                .insert('plus_code', 'topic_title')
                .values(this._geoPointPlusCode, this._topicTitle)
                .execute();

            await dHandler.session.commit();

            this._closeConnection();
            return 1;
        } else {

            //failed to settle GeoPoint
            if (isGeoPointPlusCodeSettled === -1) {

                return -1;
            }
        }

    }

    //sets the _databaseHandler object to null
    _resetDatabaseHandler() {
        this._databaseHandler = null;
    }

    //releases the database connection to pool
    async _closeConnection() {
        if (this._databaseHandler) {
            await this._databaseHandler.close();
            this._resetDatabaseHandler();
            console.log('closing connection uh')
        }
    }
}


const geoPointHandler = new GeoPointHandler(22.3574557795339, 87.32971393712405);
geoPointHandler.getNearestCoordinate().then((nearestCoor) => {
    const topicHandler = new TopicHandler('just a topic for debugging purpose', '7MJ9985M+JP');

    topicHandler.createTopic();
});
