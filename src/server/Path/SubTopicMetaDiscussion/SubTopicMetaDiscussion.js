const { SubTopicMetaDiscussHandler } = require('../../../database/table/SubTopicMetaDiscussHandler/SubTopicMetaDiscussHandler');


/**
 * 
 * @param {*} req 
 * @param {*} res
 * 
 * req.body:{
 * sub_topic_id: subtopic id
 * message: ''
 * }
 */
async function createSubTopicMetaDiscussion(req, res) {
    const info = req.body;

    const subTopicMetaDiscussHandler = new SubTopicMetaDiscussHandler();

    const result = await subTopicMetaDiscussHandler
        .createDiscussion(
            info.sub_topic_id,
            info.username,
            info.message);

    subTopicMetaDiscussHandler.release();

    res.send(result);
}

/**
 * 
 * @param {*} req 
 * @param {*} res
 * 
 * req.body = {
 * topic_id: topic id
 * }
 * 
 * res.body = [
 * {
 * meta_discuss_id: subtopic id
 * sub_topic_id: sub topic title
 * sender_id: description
 * message: message sent by sender
 * }
 * ] 
 */

async function fetchSubTopicMetaDiscussion(req, res) {
    const info = req.body;

    const subTopicMetaDiscussHandler = new SubTopicMetaDiscussHandler();

    const result = await subTopicMetaDiscussHandler.fetchAllMetaDiscussion(info.sub_topic_id);

    subTopicMetaDiscussHandler.release();

    res.send(result);
}

module.exports.createSubTopicMetaDiscussion = createSubTopicMetaDiscussion;
module.exports.fetchSubTopicMetaDiscussion = fetchSubTopicMetaDiscussion;