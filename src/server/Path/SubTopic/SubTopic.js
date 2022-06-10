const { SubTopicHandler } = require('../../../database/table/SubTopicHandler/SubTopicHandler');


/**
 * 
 * @param {*} req 
 * @param {*} res
 * 
 * req.body:{
 * topic_id: topic id
 * sub_topic_title: ''
 * sub_topic_description: ''
 * }
 */
async function createSubTopic(req, res) {
    const info = req.body;

    const location = req.session.location;

    const subTopicHandler = new SubTopicHandler();

    const result = await subTopicHandler
        .createSubTopic(
            info.topic_id,
            info.sub_topic_title,
            info.sub_topic_description);

    subTopicHandler.release();

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
 * sub_topic_id: subtopic id
 * sub_topic_title: sub topic title
 * sub_topic_description: description
 * }
 * ] 
 */
async function fetchSubTopic(req, res) {
    const info = req.body;

    const location = req.session.location;

    const subTopicHandler = new SubTopicHandler();

    const result = await subTopicHandler.fetchAllSubTopic(info.topic_id, {
        geoPointPlusCode: location.geoPointPlusCode,
        coordinate: location.coordinate
    });

    subTopicHandler.release();

    res.send(result);
}

module.exports.createSubTopic = createSubTopic;
module.exports.fetchSubTopic = fetchSubTopic;