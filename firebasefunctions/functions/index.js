const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
	response.send("Hello from Firebase!");
});

exports.getUsersInfoForChatRoom = functions.https.onCall((data, context) => {

});

exports.getChatRoomInfo = functions.https.onRequest((req, res) => {

})

/**
 * Note: Deploy to Firebase: run "firebase deploy" from ./firebasefunctions
 */