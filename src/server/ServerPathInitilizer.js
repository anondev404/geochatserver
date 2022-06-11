const {
    signIn, signUp, signOut,
    createTopic, fetchTopic,
    fetchSubTopic, createSubTopic, createSubTopicMetaDiscussion, fetchSubTopicMetaDiscussion
} = require('./Path/PathResolver');

const { sessionValidation } = require('./Middleware/Middleware');

class ServerPathInitilizer {
    _serverApp;

    constructor(serverApp) {
        this._serverApp = serverApp;
    }

    signIn() {
        this._serverApp.post('/signIn', signIn);
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

    createSubTopic() {
        this._serverApp.post('/create/subTopic', sessionValidation, createSubTopic);
    }

    fetchSubTopic() {
        this._serverApp.post('/fetch/subTopic', sessionValidation, fetchSubTopic);
    }

    createSubTopicMetaDiscussion() {
        this._serverApp.post('/create/subTopicMetaDiscussion', sessionValidation, createSubTopicMetaDiscussion);
    }

    fetchSubTopicMetaDiscussion() {
        this._serverApp.post('/fetch/subTopicMetaDiscussion', sessionValidation, fetchSubTopicMetaDiscussion);
    }

    _init() {
        this.signIn();
        this.signUp();
        this.signOut();

        this.createTopic();
        this.fetchTopic();

        this.createSubTopic();
        this.fetchSubTopic();

        this.createSubTopicMetaDiscussion();
        this.fetchSubTopicMetaDiscussion();
    }


    //initilizes all paths
    static initAllPaths(serverApp) {
        const serverPathInitilizer = new ServerPathInitilizer(serverApp);

        serverPathInitilizer._init();
    }
}

module.exports.ServerPathInitilizer = ServerPathInitilizer;