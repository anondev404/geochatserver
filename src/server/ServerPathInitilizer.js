const serverApp = require("./Server").serverApp;

const pathResolver = require('./PathResolver/PathResolver');

class ServerPathInitilizer {

    login() {
        serverApp.get('/logIn', pathResolver.logInResolver);
    }

    logOut() {
        //serverApp.get('/logOut',)
    }


    getTopic() {
        //serverApp.get('/getTopic/{topicId}'),

    }

    addTopic() {
        // serverApp.post('/addTopic',)

    }


    getSubtopic() {
        //  serverApp.get('/addMetaDiscussion')
    }

    addSubtopic() {
        //  serverApp.get('/addSubTopic',)

    }

    getMetaDiscussion() {

    }

    addMetaDiscussion() {

    }

    _init() {
        this.login();
    }


    //initilizes all paths
    static initAllPaths() {
        const serverPathInitilizer = new ServerPathInitilizer();

        serverPathInitilizer._init();
    }
}

module.exports.ServerPathInitilizer = ServerPathInitilizer;