const databaseConfig = require('../../Config');

const UserNotFoundException = require('./exception/UserNotFoundException');

class GeoUserHandler {
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

    createUser(username, password) {

    }

    validateUser(username, password) {
        //password accepted as clear text

        let usercredTable = await this._table();

        try {
            const useridResultRow = await this._getUserId(username);

            const usernameCursor = await usercredTable
                .select('username')
                .where('user_id = :userid and password = :password')
                .bind('userid', useridResultRow)
                .bind('password', password)
                .execute();

            //gets the first result row
            const usernameRowResult = await usernameCursor.fetchOne();

            if (usernameRowResult) {

                //1 returned when username, password is matched in database
                return 1;
            } else {

                //0 is returned when username or password does not match in database
                return 0;
            }

        } catch (err) {
            console.log(err);

            //rethrows UserNotFoundException
            if (err instanceof UserNotFoundException) {

                throw err;
            }

            //-1 is returned halted due to some other exception
            return -1;
        }
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

module.exports.GeoUserHandler = GeoUserHandler;