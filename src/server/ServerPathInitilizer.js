const { signIn, signUp, signOut, createTopic, fetchTopic } = require('./Path/PathResolver');

const { sessionValidation } = require('./Middleware/Middleware');

class ServerPathInitilizer {
    _serverApp;

    constructor(serverApp) {
        this._serverApp = serverApp;
    }

    signIn() {
        this._serverApp.get('/signIn', signIn);
    }


    signUp() {
        this._serverApp.post('/signUp', signUp);
    }

    signOut() {
        this._serverApp.get('/signOut', sessionValidation, signOut);
    }

    createTopic() {
        this._serverApp.post('/create/topic', sessionValidation, createTopic);
    }

    fetchTopic() {
        this._serverApp.get('/fetch/topic', sessionValidation, fetchTopic);
    }

    _init() {
        this.signIn();
        this.signUp();
        this.signOut();
        this.createTopic();
        this.fetchTopic();
    }


    //initilizes all paths
    static initAllPaths(serverApp) {
        const serverPathInitilizer = new ServerPathInitilizer(serverApp);

        serverPathInitilizer._init();
    }
}

module.exports.ServerPathInitilizer = ServerPathInitilizer;