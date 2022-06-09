const { DatabaseHandler } = require('../../DatabaseHandler');

const { GeoPointHandler } = require('../GeoPointHandler/GeoPointHandler');

const { databaseConfig } = require('../../Config');

//TODO: exception handling
//TODO: plus code regex
///(^|\s)([23456789C][23456789CFGHJMPQRV][23456789CFGHJMPQRVWX]{6}\+[23456789CFGHJMPQRVWX]{2,3})(\s|$)/?i
class TopicHandler {
    _databaseHandler;

    _topicTitle;
    _geoPointPlusCode;

    //geoPointPlusCode is main GEOPOINT coordinate plus_code from database
    constructor(topicTitle, geoPointPlusCode, databaseHandler) {
        if (!topicTitle) throw Error('Topic title(is falsy) has to be passed to TopicHandler constructor.');

        this._topicTitle = topicTitle;
        this._geoPointPlusCode = geoPointPlusCode;
    }

    async _getDatabaseHandler() {
        if (this._databaseHandler) {
            if (this._databaseHandler.isConnectionOpen) {
                return this._databaseHandler;
            }
        }

        //calling handler opens new connection to the database
        this._databaseHandler = await DatabaseHandler.getHandler();

        return this._databaseHandler;
    }

    async getSession() {
        const dHandler = await this._getDatabaseHandler();

        return dHandler.session;
    }

    async getSchema() {
        const dHandler = await this._getDatabaseHandler();

        return dHandler.schema;
    }

    //gets GEOPOINT table from database
    async _table() {
        const schema = await this.getSchema();

        return schema.getTable(databaseConfig.schema.table.TOPIC);
    }

    async settleGeoPointPLusCode(lattitude, longitude) {
        let isPlusCodeExists = null;

        if (this._geoPointPlusCode) {
            isPlusCodeExists = await GeoPointHandler.checkIfGeoPointExistsWithPlusCode(this._geoPointPlusCode);
        }

        if (!isPlusCodeExists) {
            if (lattitude > 0 && longitude > 0) {

                const dHandler = await this._getDatabaseHandler();
                const geoPointHandler = new GeoPointHandler(lattitude, longitude, dHandler);
                const nearestCoor = await geoPointHandler.createGeoPoint();

                this._geoPointPlusCode = nearestCoor[0];

                console.log(`TopicHandler: --> settleGeoPointPLusCode: Creating plus_code form coordinates [${lattitude}, ${longitude}]`)
            } else {
                console.log('TopicHandler: createTopic(lattitude, longitude) ---> COULD NOT CREATE TOPIC');

                //topic could not be created as plusCode did not match in database
                //lattitude and longitutde is not supplied either
                return -1;
            }
        }

        //geoPoint is settled: either by creating or by verifying and fetching it from database
        return 1;
    }

    //optional: lattitude, longitude - if plus code node passed in constructor
    //topic can be created by passing the plusCode(coordinate) nearest to user fetched from database
    //or passing the location lattitude, longitude 
    async createTopic(lattitude, longitude) {
        const isGeoPointPlusCodeSettled = await this.settleGeoPointPLusCode(lattitude, longitude);
        //console.debug(`TopicHandler: ---> createTopic: Is GeoPoint PlusCode SETTLED - ${isGeoPointPlusCodeSettled}`);
        //console.debug(`TopicHandler: ---> createTopic: PLUSCODE >>> ${this._geoPointPlusCode}`);

        //GeoPoint settled
        if (isGeoPointPlusCodeSettled === 1) {
            const session = await this.getSession();
            const topicTable = await this._table();

            await session.startTransaction();

            const sqlRes = await topicTable
                .insert('plus_code', 'topic_title')
                .values(this._geoPointPlusCode, this._topicTitle)
                .execute();

            await session.commit();

            return this._geoPointPlusCode;
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

    async release() {
        await this._closeConnection();
    }
}

//debug code
/*
const geoPointHandler = new GeoPointHandler(22.365239488966406, 87.32984310749357);

geoPointHandler.getNearestCoordinate().then(async (nearestCoor) => {
    //7MJ9985M+JP is-not-present-database
    await geoPointHandler.release();

    const topicHandler = new TopicHandler('just a topic for debugging purpose', '7MJ9985M+JP');

    await topicHandler.createTopic(22.365239488966406, 87.32984310749357);

    topicHandler.release();
});



const topicHandler = new TopicHandler('just a topic for debugging purpose', '7MJ9985M+JP');

topicHandler.createTopic();
*/