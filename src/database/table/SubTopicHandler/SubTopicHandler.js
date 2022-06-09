const { DatabaseHandler } = require('../../DatabaseHandler');

const { TopicHandler } = require('../TopicHandler/TopicHandler');

const { databaseConfig } = require('../../Config');

//TODO: exception handling
//TODO: plus code regex
///(^|\s)([23456789C][23456789CFGHJMPQRV][23456789CFGHJMPQRVWX]{6}\+[23456789CFGHJMPQRVWX]{2,3})(\s|$)/?i
class SubTopicHandler {
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

    //gets SUBTOPIC table from database
    async _table() {
        const schema = await this.getSchema();

        return schema.getTable(databaseConfig.schema.table.SUBTOPIC);
    }

    async verifyTopicId(topicId) {
        const topicHandler = new TopicHandler(this._databaseHandler);

        return await topicHandler.isTopicExists(topicId);
    }

    async createSubTopic(topicId, subTopicTitle, subTopicDescription) {
        const isTopicIdExists = await this.verifyTopicId(topicId);

        if (!isTopicIdExists) return { isCreated: false };

        const session = await this.getSession();
        const topicTable = await this._table();

        await session.startTransaction();

        const sqlRes = await topicTable
            .insert('topic_id', 'sub_topic_title', 'sub_topic_description')
            .values(topicId, subTopicTitle, subTopicDescription)
            .execute();

        await session.commit();

        return { isCreated: true };
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

//debug code

let subTopicHandler;

subTopicHandler = new SubTopicHandler();

let topicId = 2;

subTopicHandler.createSubTopic(topicId, 'hello world', 'lasjafsdllasjdf;asjd;f')
    .then(async (res) => {
        console.debug(`TopicId: ${topicId}: - Is Subtopic created ${res.isCreated}`);

        await subTopicHandler.release();
    });