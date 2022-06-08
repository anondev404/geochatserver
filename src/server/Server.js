const serverApp = require('express')();

const cookieSession = require('cookie-session');

const port = 3000;

//using express json middleware
app.use(express.json());

app.use(cookieSession({
    name: 'geochatserver',
    keys: [uuidv4(), uuidv4(), uuidv4()],
    path: '/',
    maxAge: 604800000,
    httpOnly: true,
    signed: true,
    overwrite: true
}));

serverApp.listen(8080);

module.exports.serverApp = serverApp;