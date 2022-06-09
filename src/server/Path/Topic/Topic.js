const { TopicHandler } = require('../../../database/table/TopicHandler/TopicHandler');

async function createTopic(req, res) {
    const info = req.body;

    const location = req.session.location;

    const topicHandler = new TopicHandler();

    const result = await topicHandler.createTopic(info.topicTitle, { geoPointPlusCode: location.geoPointPlusCode, coordinate: location.coordinate });

    topicHandler.release();

    res.send(result);
}


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