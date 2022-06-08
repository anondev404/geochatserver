const { DatabaseHandler } = require('../../DatabaseHandler');

const { databaseConfig } = require('../../Config');

class TopicHandler {
    _databaseHandler;

    _topic;
    _geoPointPlusCode;

    //geoPointPlusCode is main GEOPOINT coordinate plus_code from database
    constructor(topic, geoPointPlusCode) {
        this._topic = topic;
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

    createTopic() {

    }
}