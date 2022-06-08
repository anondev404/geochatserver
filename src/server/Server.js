const express = require('express');

const cookieSession = require('cookie-session');

const uuidv4 = require('uuid').v4;

const { ServerPathInitilizer } = require('./ServerPathInitilizer');

const serverApp = express();

const port = 3000;

//using express json middleware
serverApp.use(express.json());

serverApp.use(cookieSession({
    name: 'geochatserver',
    keys: [uuidv4(), uuidv4(), uuidv4()],
    path: '/',
    maxAge: 604800000,
    httpOnly: true,
    signed: true,
    overwrite: true
}));
/*
const { logInResolver } = require('./PathResolver/LoginResolver/loginResolver');
const { logOutResolver } = require('./PathResolver/LogOutResolver/logOutResolver');
serverApp.get('/logIn', logInResolver);
serverApp.post('/logOut', logOutResolver);*/


//initlize all paths
ServerPathInitilizer.initAllPaths(serverApp);

serverApp.listen(port, () => {
    console.log(`SERVER STARTED ON ${port}`)
});

module.exports.serverApp = serverApp;