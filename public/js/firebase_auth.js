
// Initialize Firebase
var config = {
    apiKey: "AIzaSyAN2TjQBsWx0TH3epeHpWSFnOxAzrH6PJM",
    authDomain: "cloud-final-3d3f6.firebaseapp.com",
    databaseURL: "https://cloud-final-3d3f6.firebaseio.com",
    projectId: "cloud-final-3d3f6",
    storageBucket: "cloud-final-3d3f6.appspot.com",
    messagingSenderId: "987346344951"
};
firebase.initializeApp(config);

var ui = new firebaseui.auth.AuthUI(firebase.auth())
ui.start('#firebase-auth-container', {
    signInSuccessUrl: '/signin',
    signInOptions: [
        //firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID
    ]
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    login();
  } else {
    // No user is signed in.
  }
});

function login(){
    var user = firebase.auth().currentUser;

    if (user != null) {
      user.providerData.forEach(function (profile) {
        console.log(profile);
        console.log("Sign-in provider: " + profile.providerId);
        console.log("  Provider-specific UID: " + profile.uid);
        console.log("  Name: " + profile.displayName);
        console.log("  Email: " + profile.email);
        console.log("  Photo URL: " + profile.photoURL);
      });
    }
}