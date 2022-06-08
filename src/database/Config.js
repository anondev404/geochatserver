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
            GEOUSER: 'GEOUSER',
            GEOPOINT: 'GEOPOINT',
            TOPIC: 'TOPIC',
            SUBTOPIC: 'SUBTOPIC',
            SUBTOPIICMETADISCUSS: 'SUBTOPIICMETADISCUSS'
        }
    }
}

//freezing databaseConfig object from further modifications
Object.freeze(databaseConfig);

//exporting databaseConfig object
module.exports.databaseConfig = databaseConfig;