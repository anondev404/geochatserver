const { DatabaseHandler } = require('../../DatabaseHandler');

const { databaseConfig } = require('../../Config');

const { SubTopicHandler } = require('../SubTopicHandler/SubTopicHandler');
const { GeoUserHandler } = require('../GeoUserHandler/GeoUserHandler');

//TODO: exception handling
//TODO: plus code regex
///(^|\s)([23456789C][23456789CFGHJMPQRV][23456789CFGHJMPQRVWX]{6}\+[23456789CFGHJMPQRVWX]{2,3})(\s|$)/?i
class SubTopicMetaDiscussHandler {
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

        return schema.getTable(databaseConfig.schema.table.SUBTOPICMETADISCUSS);
    }

    formatJson(columns) {
        //takes table record as input
        return (row) => {
            let format = {};

            //processes record items to produce column to value mapping
            row.forEach((rowVal, i) => {
                format[columns[i].getColumnName()] = rowVal;
            });

            Object.freeze(format);
            return format;
        };
    }

    /**
     * 
     * @param {number} subTopicId 
     * @returns subTopicId is exists else returns falsy values
     */
    async verifySubTopicId(subTopicId) {
        const subTopicHandler = new SubTopicHandler(this._databaseHandler);

        return await subTopicHandler.isSubTopicExists(subTopicId);
    }

    /**
     * 
     * @param {*} username 
     * @returns user id 
     */
    async verifyUserByUsername(username) {
        const geoUserHandler = new GeoUserHandler(this._databaseHandler);

        return await geoUserHandler.exits(username);
    }

    /**
     * 
     * @param {number} subTopicId 
     * @param {string} senderUsername 
     * @param {string} receiverUsername 
     * @param {string} message
     * @returns
     */
    async createDiscussion(subTopicId, senderUsername, message) {
        const isSubTopicExists = await this.verifySubTopicId(subTopicId);

        const senderUserId = await this.verifyUserByUsername(senderUsername);

        let resFormat = {
            isSubTopicExists: null,
            meta_discuss_id: null,
            isCreated: null,
            senderValid: null,
            message: null
        }

        if (!isSubTopicExists) {
            resFormat.isSubTopicExists = Boolean(isSubTopicExists);
            resFormat.meta_discuss_id = null;
            resFormat.isCreated = false;
            resFormat.senderValid = false;
            resFormat.message = `OOPS! Subtopic dose not exists`;

            return resFormat;
        }

        if (!senderUserId) {
            resFormat.isSubTopicExists = Boolean(isSubTopicExists);
            resFormat.meta_discuss_id = null;
            resFormat.isCreated = false;
            resFormat.senderValid = true;
            resFormat.message = `Please SignIn!`

            return resFormat;
        }

        /*console.table([{
            class: SubTopicMetaDiscussHandler.name,
            method: this.createDiscussion.name,
            subTopicId: subTopicId,
            senderUsername: senderUsername,
            isSubTopicExists: isSubTopicExists,
            senderUserId: senderUserId,
        }]);*/


        const session = await this.getSession();
        const metaDiscussTable = await this._table();

        await session.startTransaction();

        const sqlRes = await metaDiscussTable
            .insert('sub_topic_id', 'sender_id', 'message')
            .values(subTopicId, senderUserId, message)
            .execute();

        await session.commit();


        resFormat.isSubTopicExists = Boolean(isSubTopicExists);
        resFormat.meta_discuss_id = sqlRes.getAutoIncrementValue();
        resFormat.isCreated = true;
        resFormat.senderValid = true;
        resFormat.message = `Message created!`

        return resFormat;
    }

    /**
     * 
     * @param {number} subTopicId valid sub_topic_id in TOPIC database
     * @returns 
     */
    async fetchAllMetaDiscussion(subTopicId) {
        const isSubTopicExists = await this.verifySubTopicId(subTopicId);

        let resFormat = {
            isSubTopicExists: null,
            message: null,
            data: null
        }

        if (!isSubTopicExists) {
            resFormat.isSubTopicExists = Boolean(isSubTopicExists);
            resFormat.message = `OOPS! Subtopic dose not exists`;
            resFormat.data = null;

            return resFormat;
        }

        const metaDiscussTable = await this._table();

        const metaDiscussCursor = await metaDiscussTable
            .select('meta_discuss_id', 'sub_topic_id', 'sender_id', 'message', 'message_timestamp')
            .where('sub_topic_id = :subTopicId')
            .bind('subTopicId', subTopicId)
            .execute();

        const columns = metaDiscussCursor.getColumns();

        resFormat.isSubTopicExists = Boolean(isSubTopicExists);
        resFormat.message = `Meta discussion fetched!`;
        resFormat.data = metaDiscussCursor.fetchAll().map(this.formatJson(columns));

        return resFormat;
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

module.exports.SubTopicMetaDiscussHandler = SubTopicMetaDiscussHandler;

//debug code


let metaDiscuss = new SubTopicMetaDiscussHandler();

/*

metaDiscuss.createDiscussion(1, 'abc', `good topic ${new Date().getTime()}`)
    .then(async (res) => {
        console.log(res);

        await metaDiscuss.release();
    });




metaDiscuss.fetchAllMetaDiscussion(1)
    .then(async (res) => {
        console.log(res);

        await metaDiscuss.release();
    });

*/