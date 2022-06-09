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

    /**
     * 
     * @param {DatabaseHandler} databaseHandler 
     */
    constructor(databaseHandler) {
        this._databaseHandler = databaseHandler;
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

    formatJson(columns) {
        return (row) => {
            let format = {};
            row.forEach((rowVal, i) => {
                format[columns[i].getColumnName()] = rowVal;
            });

            Object.freeze(format);
            return format;
        };
    }

    /**
     * 
     * @param {string} geoPointPlusCode 
     * @param {Object} coordinate {lat: lattitude, lon: longitude} 
     * @returns
     */
    async settleGeoPointPLusCode(geoPointPlusCode, coordinate) {
        let isPlusCodeExists = null;
        let settledPlusCode = null;

        if (geoPointPlusCode) {
            isPlusCodeExists = await GeoPointHandler.checkIfGeoPointExistsWithPlusCode(geoPointPlusCode);
            settledPlusCode = geoPointPlusCode;
        }

        if (!isPlusCodeExists) {
            if (coordinate) {
                if (coordinate.lat > 0 && coordinate.lon > 0) {

                    const dHandler = await this._getDatabaseHandler();
                    const geoPointHandler = new GeoPointHandler(coordinate.lat, coordinate.lon, dHandler);
                    const nearestCoor = await geoPointHandler.createGeoPoint();

                    settledPlusCode = nearestCoor[0];

                    console.log(`TopicHandler: --> settleGeoPointPLusCode: Creating plus_code form coordinates [${coordinate.lat}, ${coordinate.lon}]`);
                }
            } else {
                console.log('TopicHandler: settleGeoPointPLusCode ---> PLUS_CODE Could not be settled');

                //topic could not be created as plusCode did not match in database
                //lattitude and longitutde is not supplied either
                return { plusCode: null, isSettled: false };
            }
        }


        //geoPoint is settled: either by creating or by verifying and fetching it from database
        return { plusCode: settledPlusCode, isSettled: true };
    }

    /**
     * 
     * @param {int} topicTitle 
     * @param {Object} geoPoint should contain plus_code or coordinate
     * @param {string} geoPoint.geoPointPlusCode if not passed coordinate should be passed
     * @param {Object} [geoPoint.coordinate] is optional if plus_code passed
     * @returns 
     */
    async createTopic(topicTitle, { geoPointPlusCode, coordinate }) {
        if (typeof topicTitle !== 'string') throw Error('Topic title must be passed as string');

        const settledGeoPointPlusCode = await this.settleGeoPointPLusCode(geoPointPlusCode, coordinate);
        //console.debug(`TopicHandler: ---> createTopic: Is GeoPoint PlusCode SETTLED - ${isGeoPointPlusCodeSettled}`);
        //console.debug(`TopicHandler: ---> createTopic: PLUSCODE >>> ${geoPointPlusCode}`);

        if (settledGeoPointPlusCode) {
            //GeoPoint settled
            if (settledGeoPointPlusCode.isSettled) {
                const session = await this.getSession();
                const topicTable = await this._table();

                await session.startTransaction();

                const sqlRes = await topicTable
                    .insert('plus_code', 'topic_title')
                    .values(settledGeoPointPlusCode.plusCode, topicTitle)
                    .execute();

                await session.commit();

                return { isSettled: true, plusCode: settledGeoPointPlusCode.plusCode };
            } else {
                //failed to settle GeoPoint
                return { isSettled: false, plusCode: null };
            }
        }
    }

    /**
     * 
     * @param {Object} geoPoint should contain plus_code or coordinate
     * @param {string} geoPoint.geoPointPlusCode if not passed coordinate should be passed
     * @param {Object} geoPoint.coordinate is optional if plus_code passed
     * @returns 
     */
    async fetchAllTopic({ geoPointPlusCode, coordinate }) {
        const settledGeoPointPlusCode = await this.settleGeoPointPLusCode(geoPointPlusCode, coordinate);

        if (settledGeoPointPlusCode) {
            //GeoPoint plus code settled
            if (settledGeoPointPlusCode.isSettled) {
                const topicTable = await this._table();

                const topicCursor = await topicTable
                    .select('topic_id', 'topic_title')
                    .where('plus_code = :plusCode')
                    .bind('plusCode', settledGeoPointPlusCode.plusCode)
                    .execute();

                const columns = topicCursor.getColumns();

                const dataJson = topicCursor.fetchAll().map(this.formatJson(columns));


                return { isFetched: true, data: dataJson };
            } else {
                //failed to settle GeoPoint plus code 
                return { isFetched: false, data: null };
            }
        }
    }

    /**
     * 
     * @param {number} topicId 
     * @returns 
     */
    async isTopicExists(topicId) {
        const topicTable = await this._table();

        const topicRow = await topicTable
            .select('topic_id')
            .where('topic_id = :topicId')
            .bind('topicId', topicId)
            .execute()
            .then((topicCursor) => {
                return topicCursor.fetchOne();
            });


        if (topicRow) {
            return topicRow[0];
        }

        return null;
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

    //release resources
    //call after task complete otherwise will result in resource leaks
    async release() {
        await this._closeConnection();
    }
}

module.exports.TopicHandler = TopicHandler;

//debug code

let topicHandler;
/*
const geoPointHandler = new GeoPointHandler(22.365239488966406, 87.32984310749357);

geoPointHandler.getNearestCoordinate().then(async (nearestCoor) => {
    //7MJ9985M+JP is-not-present-database
    await geoPointHandler.release();

    topicHandler = new TopicHandler();

    //'7MJ9985M+JP'
    //coordinate: { lat: 22.365239488966406, lon: 87.32984310749357 } 
    const result = await topicHandler.createTopic('1sss just a topic for debugging purpose', { geoPointPlusCode: '7MJ9985M+JW' });
    console.log(result);

    topicHandler.release();
});



topicHandler = new TopicHandler();

topicHandler.fetchAllTopic({ geoPointPlusCode: '7MJ9985M+JW' })
    .then(async (data) => {
        console.log(data.data);
        await topicHandler.release();
    });

topicHandler = new TopicHandler();
topicHandler.isTopicExists(3).then(async (count) => {
    console.log(count);
    await topicHandler.release();
});*/
