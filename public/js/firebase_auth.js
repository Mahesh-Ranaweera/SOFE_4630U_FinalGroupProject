
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


//signout the user
function signout(){
    //signout the user
    firebase.auth().signOut().then(function() {
      console.log('Signed Out');
    }, function(error) {
      console.error('Sign Out Error', error);
    });
}

