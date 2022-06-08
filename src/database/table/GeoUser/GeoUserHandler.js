const { databaseConfig } = require('../../Config');

const { DatabaseHandler } = require('../../DatabaseHandler');

const { UserNotFoundException, UserAlreadyExistsException } = require('./exception/GeoUserHandlerException');

class GeoUserHandler {
    _databaseHandler;

    static getHandler() {
        return new GeoUserHandler();
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

        return await dHandler.schema.getTable(databaseConfig.schema.table.GEOUSER);
    }


    //checks if user exists in database and returs it's user id
    async exits(username) {
        const geoUserTable = await this._table();

        const useridCursor = await geoUserTable
            .select('user_id')
            .where('username = :username')
            .bind('username', username)
            .execute();

        //gets the first result row
        const useridResultRow = await useridCursor.fetchOne();

        //user id
        return useridResultRow;
    }

    async createUser(username, password) {
        console.log('creating user');
        let geoUserTable = await this._table();

        const dHandler = await this._getDatabaseHandler();
        await dHandler.session.startTransaction();

        try {
            //todo: username, password not parsed
            const sqlRes = await geoUserTable
                .insert('username', 'password')
                .values(username, password)
                .execute();

            await dHandler.session.commit();

            //on acct created
            return 1;
        } catch (err) {
            console.log(err);

            if (err.info) {
                if (err.info.code === 1062) {

                    //acct info already exits in database
                    throw new UserAlreadyExistsException();
                }
            }

            await dHandler.session.rollback();

            //on other reasonn acct creation failure
            return -1;
        } finally {
            await this._closeConnection();
        }
    }

    async validateUser(username, password) {
        //TODO: password accepted as clear text

        let geoUserTable = await this._table();

        try {
            let userId = this.getUserId(username);

            const usernameCursor = await geoUserTable
                .select('username')
                .where('user_id = :userid and password = :password')
                .bind('userid', userId)
                .bind('password', password)
                .execute();

            //gets the first result row
            const usernameRowResult = await usernameCursor.fetchOne();

            if (usernameRowResult) {

                //useranme is returned when username, password is matched in database
                return usernameRowResult[0];
            } else {

                //UserNotFoundException thrown when username or password does not match in database
                throw new UserNotFoundException();
            }

        } catch (err) {
            console.log(err);

            //rethrows UserNotFoundException if caught
            if (err instanceof UserNotFoundException) {

                throw err;
            }

            //-1 is returned halted due to some other exception
            return -1;
        }
    }


    async getUserId(username) {
        const userId = await this.exits(username);

        if (userId) {

            //returns user id if user is found
            return userId;
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