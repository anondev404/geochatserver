const { DatabaseHandler } = require('../../DatabaseHandler');

const { TopicHandler } = require('../TopicHandler/TopicHandler');

const { databaseConfig } = require('../../Config');

//TODO: exception handling
//TODO: plus code regex
///(^|\s)([23456789C][23456789CFGHJMPQRV][23456789CFGHJMPQRVWX]{6}\+[23456789CFGHJMPQRVWX]{2,3})(\s|$)/?i
class SubTopicHandler {
    _databaseHandler;

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

    //gets SUBTOPIC table from database
    async _table() {
        const schema = await this.getSchema();

        return schema.getTable(databaseConfig.schema.table.SUBTOPIC);
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
     * @param {number} topicId 
     * @returns 
     */
    async verifyTopicId(topicId) {
        const topicHandler = new TopicHandler(this._databaseHandler);

        return await topicHandler.isTopicExists(topicId);
    }

    /**
     * 
     * @param {number} topicId 
     * @param {string} subTopicTitle 
     * @param {string} subTopicDescription 
     * @returns 
     */
    async createSubTopic(topicId, subTopicTitle, subTopicDescription) {
        const isTopicIdExists = await this.verifyTopicId(topicId);

        if (!isTopicIdExists) return { isCreated: false };

        const session = await this.getSession();
        const subTopicTable = await this._table();

        await session.startTransaction();

        const sqlRes = await subTopicTable
            .insert('topic_id', 'sub_topic_title', 'sub_topic_description')
            .values(topicId, subTopicTitle, subTopicDescription)
            .execute();

        await session.commit();

        return { isCreated: true };
    }

    /**
     * 
     * @param {number} topicId valid topic_id in TOPIC database
     * @returns 
     */
    async fetchAllSubTopic(topicId) {
        const isTopicIdExists = await this.verifyTopicId(topicId);

        if (!isTopicIdExists) return { isFetched: false, data: null };

        const subTopicTable = await this._table();

        const subTopicCursor = await subTopicTable
            .select('sub_topic_id', 'sub_topic_title', 'sub_topic_description')
            .where('topic_id = :topicId')
            .bind('topicId', topicId)
            .execute();

        const columns = subTopicCursor.getColumns();

        const dataJson = subTopicCursor.fetchAll().map(this.formatJson(columns));

        return { isFetched: true, data: dataJson };
    }

    /**
     * 
     * @param {number} topicId 
     */
    async isSubTopicExists(subTopicId) {
        const subTopicTable = await this._table();

        const subTopicRow = await subTopicTable
            .select('sub_topic_id')
            .where('sub_topic_id = :subTopicId')
            .bind('subTopicId', subTopicId)
            .execute()
            .then((subTopicCursor) => {
                return subTopicCursor.fetchOne();
            });


        if (subTopicRow) {
            return subTopicRow[0];
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

//debug code

let subTopicHandler;

subTopicHandler = new SubTopicHandler();

let subTopicId = 0;
let topicId = 2;

/*
subTopicHandler.createSubTopic(topicId, 'hello world', 'lasjafsdllasjdf;asjd;f')
    .then(async (res) => {
        console.debug(`TopicId: ${topicId}: - Is Subtopic created ${res.isCreated}`);

        await subTopicHandler.release();
    });


subTopicHandler.isSubTopicExists(subTopicId).then(async (id) => {
    if (id) {
        console.log(`SubTopic exists with id = ${id}`);
    } else {
        console.log(`SubTopic does not exist with id = ${id}`);
    }

    await subTopicHandler.release();
});
*/

subTopicHandler.fetchAllSubTopic(topicId).then(async (res) => {
    if (res.isFetched && res.data.length > 0) {
        console.log(res.data);
    } else {
        console.log(`No Subtopic added under topic_id: ${topicId}`);
    }

    await subTopicHandler.release();
});