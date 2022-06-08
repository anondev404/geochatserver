const databaseConfig = {
    connection: {
        password: 'root',
        user: 'root',
        host: 'localhost',
        port: 33060,
    },
    schema: {
        name: 'GEOCHATSERVER',
        table: {
            geoUser: 'GEOUSER',
            topic: 'TOPIC',
            subtopic: 'SUBTOPIC',
            subtopicMetaDiscuss: 'SUBTOPIICMETADISCUSS'
        }
    }
}

module.exports.databaseConfig = databaseConfig;