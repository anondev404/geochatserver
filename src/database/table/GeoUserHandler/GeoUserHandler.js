const { databaseConfig } = require('../../Config');

const { DatabaseHandler } = require('../../DatabaseHandler');

const { UserNotFoundException, UserAlreadyExistsException, InvalidCredentials } = require('./GeoUserHandlerException/GeoUserHandlerException');

const { UnknownException } = require('../GlobalDatabaseTableHandlerException/UnknownException');

class GeoUserHandler {
    _databaseHandler;

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

    static getHandler(databaseHandler) { return new GeoUserHandler(databaseHandler); };

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

        if (useridResultRow) {
            //user id
            return useridResultRow[0];
        } else {

            //user id row does not exists
            return null;
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

    async validateUser(username, password) {
        //TODO: password accepted as clear text

        let userId;
        let usernameRowResult;
        let geoUserTable = await this._table();

        try { userId = await this.getUserId(username); }
        catch (err) {
            if (err instanceof UserNotFoundException) {
                throw err;
            }
        }

        try {
            const usernameCursor = await geoUserTable
                .select('username')
                .where('user_id = :userid and password = :password')
                .bind('userid', userId)
                .bind('password', password)
                .execute();

            //gets the first result row
            usernameRowResult = await usernameCursor.fetchOne();
        } catch (err) {
            console.log(err);

            //UnknownException halted due to some other exception
            throw new UnknownException(err);
        }

        if (usernameRowResult) {

            //useranme is returned when username, password is matched in database
            return usernameRowResult[0];
        } else {

            //UserNotFoundException thrown when username or password does not match in database
            throw new InvalidCredentials();
        }
    }


    async createUser(username, password) {
        console.log('creating user');
        let geoUserTable = await this._table();

        if (await this.exits(username)) {

            throw new UserAlreadyExistsException();
        } else {
            const session = await this.getSession();
            await session.startTransaction();

            try {
                //todo: username, password not parsed
                const sqlRes = await geoUserTable
                    .insert('username', 'password')
                    .values(username, password)
                    .execute();

                await session.commit();

                //on acct created
                return 1;
            } catch (err) {
                console.log(err);

                await session.rollback();

                //on other reasonn acct creation failure
                throw new UnknownException(err);
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

    //release resources
    //call after task complete otherwise will result in resource leaks
    async release() {
        await this._closeConnection();
    }
}

module.exports.GeoUserHandler = GeoUserHandler;