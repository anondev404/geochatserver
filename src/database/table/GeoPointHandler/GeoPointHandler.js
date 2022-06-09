const { OpenLocationCode } = require('open-location-code');

const { DatabaseHandler } = require('../../DatabaseHandler');

const { databaseConfig } = require('../../Config');

/*
22.3476586, 87.3314167
*/

class GeoPointHandler {
    _lattitude;
    _longitude;

    _databaseHandler;

    constructor(lattitude, longitude, databaseHandler) {
        this._databaseHandler = databaseHandler;
        this._lattitude = lattitude;
        this._longitude = longitude;
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

        return schema.getTable(databaseConfig.schema.table.GEOPOINT);
    }

    getPlusCode() {
        const openLocationCode = new OpenLocationCode();
        return openLocationCode.encode(this._lattitude, this._longitude);
    }

    distanceInMetersBtwCoordinates(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const d = R * c; // in metres

        return d;
    }


    checkIfCoorInRange(lat1, lon1, lat2, lon2) {
        const _range = 500;

        const dis = this.distanceInMetersBtwCoordinates(lat1, lon1, lat2, lon2);

        console.log(`distance ---> ${dis}`);

        if (dis > _range) {
            return false;
        }

        return true;
    }

    static async checkIfGeoPointExistsWithPlusCode(plusCode) {
        const geoPointHandler = new GeoPointHandler();

        const geoPointTable = await geoPointHandler._table();

        const coorCursor = await geoPointTable
            .select('plus_code', 'lattitude', 'longitude')
            .where('plus_code = :plusCode')
            .bind('plusCode', plusCode)
            .execute();

        const tallyPlusCode = coorCursor.fetchOne();

        if (tallyPlusCode) {
            if (tallyPlusCode[0] === plusCode) {
                return true;
            }
        }

        return false;
    }


    async createGeoPoint() {
        //console.log(this.getPlusCode());
        const dHandler = await this._getDatabaseHandler();

        let nearestCoor;

        try {
            nearestCoor = await this.getNearestCoordinate();
        }
        catch (err) {
            return -1;
        }

        console.log(`nearestCoor ---> ${nearestCoor}`);

        if (nearestCoor === -1) {
            const session = await this.getSession();
            try {
                const geoPointTable = await this._table();
                await session.startTransaction();

                const sqlRes = await geoPointTable
                    .insert('plus_code', 'lattitude', 'longitude')
                    .values(this.getPlusCode(), this._lattitude, this._longitude)
                    .execute();


                await session.commit();

                return [this.getPlusCode(), this._lattitude, this._longitude];
            } catch (err) {
                console.log(err);

                await session.rollback();

                return -1;
            }
        }
        else {
            if (nearestCoor) {

                //already in range with coordinate nearestCoor[0] plus code, nearestCoor[1] lat, nearestCoor[2] lon
                return nearestCoor;
            }
        }
    }


    async getNearestCoordinate() {
        //TODO: close database connection
        //console.log(this.getPlusCode());
        const geoPointTable = await this._table();

        try {
            const coorCursor = await geoPointTable
                .select('plus_code', 'lattitude', 'longitude')
                .orderBy('lattitude asc')
                .orderBy('longitude asc')
                .execute();

            let coor;
            let isInRange;

            while (true) {
                /*
                plusCode ---> coor[0]
                lattitude ---> coor[1]
                longitude ---> coor[2]
                */
                coor = coorCursor.fetchOne();

                //if database is empty the coor fetched is undefined
                //this check therefore protects against that
                if (coor) {
                    console.log(`\ncoordinate --> ${coor}`);

                    isInRange = this.checkIfCoorInRange(this._lattitude, this._longitude, coor[1], coor[2]);

                    console.log(`is coordinate range ---> ${isInRange}\n`);

                    if (isInRange) {
                        console.log(`[${this._lattitude}, ${this._longitude}] in range with [${coor}]`);

                        //coor(coor[0] plus code, coor[1] lat, coor[2] lon) returned 
                        //if given coordinate is in _range with no other coordinates in database
                        //then it is safe to add in database
                        return coor;
                    }

                } else {
                    break;
                }
            }

            console.log('lat %d lon %d is not in range with no other coordinate', this._lattitude, this._longitude);

            //given coordinate(this._lattitude, this._longitude) is range with other coordinate in database
            return -1;
        } catch (err) {
            console.log(err);

            throw err;
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

module.exports.GeoPointHandler = GeoPointHandler;

//22.3476586, 87.3314167 start
//22.347660459650296, 87.33144038255718 in-range
//22.348136850549547, 87.33220278810084 in-range
//22.351084477836352, 87.33420568724297 in-range
//22.354359921272135, 87.33568090220645 not-in-range
//22.35900360027107, 87.33486020237099 not-in-range

//debug code
const handler = new GeoPointHandler(22.35900360027107, 87.33486020237099);

handler.createGeoPoint();
handler.release();
/*
let dis = handler.distanceInMetersBtwCoordinates(22.3476586, 87.3314167, 22.35900360027107, 87.33486020237099);
console.log(dis);

handler.getNearestCoordinate();
*/