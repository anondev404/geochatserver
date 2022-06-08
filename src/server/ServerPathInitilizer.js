const { logIn, logOut } = require('./Path/PathResolver');

class ServerPathInitilizer {
    _serverApp;

    constructor(serverApp) {
        console.log('------------------------------')
        console.log(serverApp)
        this._serverApp = serverApp;
    }

    signIn() {
        this._serverApp.get('/signIn', logIn);
    }


    signUp() {
        this._serverApp.post('/signUp', logOut);
    }

    _init() {
        this.signIn();
        this.signUp();
    }


    //initilizes all paths
    static initAllPaths(serverApp) {
        const serverPathInitilizer = new ServerPathInitilizer(serverApp);

        serverPathInitilizer._init();
    }
}

module.exports.ServerPathInitilizer = ServerPathInitilizer;