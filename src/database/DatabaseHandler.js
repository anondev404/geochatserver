const mysqlx = require('@mysql/xdevapi');
const { databaseConfig } = require('./Config');

//Database handler manages the connection to the database
class DatabaseHandler {
    _client;
    _session;
    _schema;

    async _init() {
        await this._setClient();
        await this._setSession();
        await this._setSchema();
        //console.log('database initilized');
    }

    //sets the client with req config like pool size
    async _setClient() {
        this._client = await mysqlx.getClient(
            databaseConfig.connection,
            {
                pooling: {
                    enabled: true,
                    maxSize: 25
                }
            }
        );
    }

    //sets the session by getting a connection from the pool
    async _setSession() {
        try {
            this._session = await this.client.getSession(databaseConfig.connection);
            //console.log('session initilized');
        } catch (err) {
            //console.error('failed: session not initilized');
        }
    }

    //intilizes the schema GEOCHATSERVER database
    async _setSchema() {
        try {
            this._schema = await this.session.getSchema(databaseConfig.schema.name);
            //console.log('schema fetched');
        } catch (err) {
            //console.error('failed: schema could not be fetched');
        }
    }

    //gets the curren client
    get client() {
        return this._client;
    }

    //gets the current active session
    get session() {
        return this._session;
    }

    //gets the current schema wrt the connection
    get schema() {
        return this._schema;
    }

    //creates and initilizes DatabaseHandler object
    //return the object
    static async getHandler() {
        let handler = new DatabaseHandler();
        await handler._init();

        //console.log('databasehandler initilized');

        return handler;
    }

    get isConnectionOpen() {
        //getConnection()_ method is private_api
        //method declared in connection module
        return this.session.getConnection_().isOpen();
    }

    async close() {
        //release connection into connection pool
        await this.session.close();
    }
}

module.exports.DatabaseHandler = DatabaseHandler;