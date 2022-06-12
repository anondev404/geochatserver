const mysqlx = require('@mysql/xdevapi');
const { databaseConfig } = require('./Config');

class _DatabaseClientHandler {
    _client;

    static _databaseClientHandler;

    async init() {
        await this._setClient();

    }

    //sets the client with req config like pool size
    async _setClient() {
        this._client = await mysqlx.getClient(
            databaseConfig.connection,
            {
                pooling: {
                    enabled: true,
                    maxSize: 3000
                }
            }
        );
    }

    static async getHandler() {
        if (_DatabaseClientHandler._databaseClientHandler) {
            return _DatabaseClientHandler._databaseClientHandler;
        }

        await _DatabaseClientHandler.setHandler();

        return _DatabaseClientHandler._databaseClientHandler;
    }

    static async setHandler() {
        const databaseClientHandler = new _DatabaseClientHandler();
        await databaseClientHandler.init();

        _DatabaseClientHandler._databaseClientHandler = databaseClientHandler;
    }

    //gets the curren client
    get client() {
        return this._client;
    }
}

//Database handler manages the connection to the database
class DatabaseHandler {
    _session;
    _schema;

    async _init(client) {
        await this._setSession(client);
        await this._setSchema();
        //console.log('database initilized');
    }

    //sets the session by getting a connection from the pool
    async _setSession(client) {
        try {
            this._session = await client.getSession();
        } catch (err) {
            console.error('DatabaseHandler: ---> _setSession: FAILED SESSION NOT INIT');
        }
    }

    //intilizes the schema GEOCHATSERVER database
    async _setSchema() {
        try {
            this._schema = await this._session.getSchema(databaseConfig.schema.name);
        } catch (err) {
            console.error(err);
            console.error('DatabaseHandler: ---> _setSchema: FAILED TO INIT SCHEMA');
        }
    }

    //creates and initilizes DatabaseHandler object
    //return the object
    static async getHandler() {
        let databaseClientHandler = await _DatabaseClientHandler.getHandler();

        const databaseHandler = new DatabaseHandler();
        await databaseHandler._init(databaseClientHandler.client);

        return databaseHandler;
    }

    //gets the current active session
    async getNewSessionFromPool() {
        await _DatabaseClientHandler.getHandler()
            .then(async (databaseClientHandler) => {
                await this._setSession(databaseClientHandler.client);
            });

        return this._session;
    }

    //gets the current schema wrt the connection
    get schema() {
        return this._schema;
    }

    get session() {
        return this._session;
    }

    get isConnectionOpen() {
        //getConnection()_ method is private_api
        //method declared in connection module
        return this.session.getConnection_().isOpen();
    }

    async close() {

        //realeases connection to connection pool
        await this._session.close();
    }
}

module.exports.DatabaseHandler = DatabaseHandler;