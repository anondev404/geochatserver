const express = require('express');

const session = require('express-session');

const serverApp = express();

const port = 3000;

//using express json middleware
app.use(express.json());

app.use(session({
    name: 'geochatserver',
    secret: uuidv5('www.mygeochatserver.com', uuidv5.URL),
    genid: () => {
        return uuidv4();
    },
    cookie: {
        path: '/',
        maxAge: 604800000,
        httpOnly: true,
    }
}));

serverApp.listen(8080);

module.exports.serverApp = serverApp;