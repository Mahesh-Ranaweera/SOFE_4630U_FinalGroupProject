
var ui = new firebaseui.auth.AuthUI(firebase.auth())
ui.start('#firebase-auth-container', {
    signInSuccessUrl: '/signup',
    signInOptions: [
        //firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID
    ]
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    signup();
  } else {
    // No user is signed in.
    console.log("user signed out");
  }
});

function signup(){
    var user = firebase.auth().currentUser;

    if (user != null) {
      user.providerData.forEach(function (profile) {
        console.log(profile);
        if(userSIGNUP(profile)){
            signout();
        }
      });
    }
}

function userSIGNUP(userdata){
    //perform the post request
    var form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", "/user_signup");

    var payload = document.createElement("input");
    payload.setAttribute("type", "hidden");
    payload.setAttribute("name", "strpayload");
    payload.setAttribute("value", JSON.stringify(userdata));
    form.appendChild(payload);

    var payload2 = document.createElement("input");
    payload2.setAttribute("type", "hidden");
    payload2.setAttribute("name", "auth_method");
    payload2.setAttribute("value", "firebase");
    form.appendChild(payload2);

    //submit the form
    document.body.append(form);
    form.submit();

    return true;
}