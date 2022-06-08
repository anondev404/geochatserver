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

    constructor(lattitude, longitude) {
        this._lattitude = lattitude;
        this._longitude = longitude;
    }


    getPlusCode() {
        const openLocationCode = new OpenLocationCode();
        return openLocationCode.encode(this._lattitude, this._longitude);
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

        return await dHandler.schema.getTable(databaseConfig.schema.table.GEOPOINT);
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

    static async checkIfGeoPointExists(plusCode) {
        const geoPointHandler = new GeoPointHandler();

        let geoPointTable = await geoPointHandler._table();

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

        geoPointHandler._closeConnection();
        return false;
    }


    async createGeoPoint() {
        //console.log(this.getPlusCode());
        let geoPointTable = await this._table();

        const dHandler = await this._getDatabaseHandler();

        let nearestCoor;

        try {
            nearestCoor = await this.getNearestCoordinate();
        }
        catch (err) {
            return -1;
        }

        console.log(`nearestCoor ---> ${nearestCoor}`);

        if (nearestCoor === 1) {

            //already in range with coordinate nearestCoor[0] plus code, nearestCoor[1] lat, nearestCoor[2] lon
            return nearestCoor;
        } else {
            if (nearestCoor === -1) {
                try {
                    await dHandler.session.startTransaction();

                    const sqlRes = await geoPointTable
                        .insert('plus_code', 'lattitude', 'longitude')
                        .values(this.getPlusCode(), this._lattitude, this._longitude)
                        .execute();

                    await dHandler.session.commit();

                    return [this.getPlusCode(), this._lattitude, this._longitude];
                } catch (err) {
                    console.log(err);

                    await dHandler.session.rollback();

                    return -1;
                } finally {
                    await this._closeConnection();
                }
            }
        }

        await this._closeConnection();
    }


    async getNearestCoordinate() {
        //TODO: close database connection
        //console.log(this.getPlusCode());
        let geoPointTable = await this._table();

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
}

module.exports.GeoPointHandler = GeoPointHandler;

//22.3476586, 87.3314167 start
//22.347660459650296, 87.33144038255718 in-range
//22.348136850549547, 87.33220278810084 in-range
//22.351084477836352, 87.33420568724297 in-range
//22.354359921272135, 87.33568090220645 not-in-range
//22.35900360027107, 87.33486020237099 not-in-range
/*
//debug code
const handler = new _GeoPointHandler(22.3574557795339, 87.32971393712405);

handler.createGeoPoint();

let dis = handler.distanceInMetersBtwCoordinates(22.3476586, 87.3314167, 22.35900360027107, 87.33486020237099);
console.log(dis);

handler.getNearestCoordinate();
*/