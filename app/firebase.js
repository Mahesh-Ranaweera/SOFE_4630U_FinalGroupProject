var fbConf = require('./config')
var firebase = requrie('firebase');

firebase.initializeApp(fbConf.config);