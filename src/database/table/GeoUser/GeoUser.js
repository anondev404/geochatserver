const databaseConfig = require('../../Config');

const UserNotFoundException = require('./exception/UserNotFoundException');

class GeoUser {
    _databaseHandler;

    static getHandler() {
        return new GeoUser();
    }

    async _getDatabaseHandler() {
        if (this._databaseHandler) {

            console.log(this._databaseHandler.isConnectionOpen);

            if (this._databaseHandler.isConnectionOpen) {
                return this._databaseHandler;
            }
        }

        //calling handler opens/fetches a connection to the database
        this._databaseHandler = await DatabaseHandler.getHandler();

        return this._databaseHandler;
    }

    //gets GEOUSER table from database
    async _table() {
        const dHandler = await this._getDatabaseHandler();

        return await dHandler.schema.getTable(databaseConfig.schema.table.geoUser);
    }

    addUser(username, password) {

    }

    validateUser(username, password) {

    }

    exits(username) {

    }

    getUserId(username) {
        if (this.exits(username)) {
            const geoUserTable = await this._table();

            const useridCursor = await geoUserTable
                .select('user_id')
                .where('username = :username')
                .bind('username', username)
                .execute();

            //gets the first result row
            const useridResultRow = await useridCursor.fetchOne();

            return useridResultRow[0];
        }

        throw new UserNotFoundException();
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

module.exports.GeoUserTable = GeoUserTable;