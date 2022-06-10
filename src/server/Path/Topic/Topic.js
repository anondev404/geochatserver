const { TopicHandler } = require('../../../database/table/TopicHandler/TopicHandler');

/**
 * 
 * @param {*} req 
 * @param {*} res
 * 
 * req.body = {
 * "topicTitle": "topic title"
 * } 
 */
async function createTopic(req, res) {
    const info = req.body;

    const location = req.session.location;

    const topicHandler = new TopicHandler();

    const result = await topicHandler.createTopic(info.topicTitle, { geoPointPlusCode: location.geoPointPlusCode, coordinate: location.coordinate });

    topicHandler.release();

    res.send(result);
}

/**
 * 
 * @param {*} req 
 * @param {*} res
 * 
 * req.body = {
 * }
 * 
 * res.body = {
 * "topic_id": 23,
 * "topic_title": "rest title sdsdvfsdfsd"
 * } 
 */
async function fetchTopic(req, res) {
    const info = req.body;

    const location = req.session.location;

    const topicHandler = new TopicHandler();

    const result = await topicHandler.fetchAllTopic({ geoPointPlusCode: location.geoPointPlusCode, coordinate: location.coordinate });

    topicHandler.release();

    res.send(result);
}

module.exports.createTopic = createTopic;
module.exports.fetchTopic = fetchTopic;