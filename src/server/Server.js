const express = require('express');

const cookieSession = require('cookie-session');

const cors = require('cors');

const uuidv4 = require('uuid').v4;

const { ServerPathInitilizer } = require('./ServerPathInitilizer');

const serverApp = express();

const port = 3000;

//using express json middleware
serverApp.use(express.json());
/**
 * we will running server on localhost:3000 and web app on localhost:3001(API SERVER)
 * any request from localhost:3001 to localhost:3000 is identified as Cross-Origin Resource Sharing
 * because domains does match or is not a sub-domain of other
 * so, to send cross-origin cookies we need to the necessary bit configuration.
 * 
 * as we find the cofiguration done below "secure: true"
 * which means connection should be https. as we are in development we want to do it in http.
 * even with this configuration done still cookie cannot be set in the client browser.
 * In order to set the cookie (only in development) --> one last thing needs to be done.
 * >>> set a proxy-server with react. 
 * So react will send the request to proxy-server. Then proxy-server should redirect to the actual server.
 */

serverApp.use(cors({
    //we need let know from which cross-origin, request will originate
    origin: 'http://localhost:3001',
    //expect credential(cookies) to be sent from browser.
    //webapp(client) need to pass withCredentials: true in order to send the cookie to browsert
    credentials: true,
}));

serverApp.disable('etag');

serverApp.use(cookieSession({
    name: 'geochatserver',
    keys: [uuidv4(), uuidv4(), uuidv4()],
    path: '/',
    maxAge: 604800000,
    httpOnly: true,
    signed: true,
    overwrite: true,
    /**
     * secure needs to be set to true.
     * Only when "secure: true", cross-domain cookies wont be sent by browser.
     * Otherwise "secure: false" it only sends cookies set by the same domain.
     * As, we will using a proxy-server in development we no-longer need it to
     * set "secure: true" as now web app proxies the request to us
     * browser (requests resource)---> localhost:3000 (fetch data from api-server)---> proxy-server --> localhost:3001
     * localhost:3001 (sends resource)--> proxy-server --> localhost:3000 --> browser 
     */
    secure: false,
    //expect cookies to be sent from cross-origin domains
    sameSite: 'lax'
}));

//initlize all paths
ServerPathInitilizer.initAllPaths(serverApp);

serverApp.listen(port, () => {
    console.log(`SERVER STARTED ON ${port}`)
});

module.exports.serverApp = serverApp;