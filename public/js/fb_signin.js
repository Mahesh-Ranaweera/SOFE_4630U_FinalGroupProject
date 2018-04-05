var db = firebase.database();
var ui = new firebaseui.auth.AuthUI(firebase.auth())
ui.start('#firebase-auth-container', {
    signInSuccessUrl: '/dashboard',
    signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID
    ]
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    signin();
  } else {
    // No user is signed in.
    console.log("user signed out");
  }
});

function signin(){
    var user = firebase.auth().currentUser;

    if (user != null) {
      //Add public user info to Firebase
      userInfo = {};
      userInfo['users/' + user.uid + '/name'] = user.displayName;
      userInfo['users/' + user.uid + '/profilePic'] = user.photoURL;
      db.ref().update(userInfo);

      user.providerData.forEach(function (profile) {
        if(userSIGNIN(profile)){
            //signout();
            //console.log('Wheee!');
        }
      });
    }
}

function userSIGNIN(userdata){
    //perform the post request
    var form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", "/user_auth");

    /**send signin/signup data to db**/
    var payload = document.createElement("input");
    payload.setAttribute("type", "hidden");
    payload.setAttribute("name", "strpayload");
    payload.setAttribute("value", JSON.stringify(userdata));
    form.appendChild(payload);

    //submit the form
    $(document.body).append(form);
    form.submit();

    return true;
}