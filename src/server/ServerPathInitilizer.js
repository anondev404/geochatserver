const { signIn, signUp, signOut } = require('./Path/PathResolver');


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
        this._serverApp.get('/signOut', signOut);
    }

    _init() {
        this.signIn();
        this.signUp();
        this.signOut();
    }


    //initilizes all paths
    static initAllPaths(serverApp) {
        const serverPathInitilizer = new ServerPathInitilizer(serverApp);

        serverPathInitilizer._init();
    }
}

module.exports.ServerPathInitilizer = ServerPathInitilizer;