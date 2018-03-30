var express = require('express');
var router = express.Router();
var session = require('express-session');
var dbconn = require('../app/db');
var encrypt = require('../app/encrypt');
var univ_list = require('../app/univ_list.json');
var Identicon= require('identicon.js');

/**Options for indenticon**/
var Iden_options = {
    foreground: [Math.floor(Math.random() * 254), Math.floor(Math.random() * 254), Math.floor(Math.random() * 254), 255],    
    background: [238, 238, 238, 238], 
    margin: 0.2,    
    size: 32,               
    format: 'svg'   
};


/**SET the session*/
router.use(session({
    secret: 'HV3U00lcMahc84050VxX62xoMS67NhS4',
    resave: true,
    saveUninitialized: true,
    path: '/'
}));


/**GET home page. */
router.get('/', function(req, res, next) {

	if(req.session.usersess){
		res.redirect('/dashboard');
	}else{
		res.render('index', { title: 'Student Collaboration' });
	}
});


/**GET signin page*/
router.get('/signin', function(req, res, next){
	var alert = null;

    if(req.query.notify != null){
        alert = req.query.notify;
    }

    res.render('signin', {
        title: 'Signin',
        alert: alert
	});
});


/**GET signup page*/
router.get('/signup', function(req, res, next){
	var alert = null;

    if(req.query.notify != null){
        alert = req.query.notify;
    }

    //console.log(univ_list);

    res.render('signup', {
        title: 'Signup',
        alert: alert,
        univ_list: univ_list
	});
});


/**GET user dashboard */
router.get('/dashboard', function(req, res, next){
    /**Makesure user session exists */
    if (req.session.usersess) {

        var alert = null;

        if(req.query.notify != null){
            alert = req.query.notify;
        }

        console.log(req.session.udata.email);

        //get the groups for the user
        dbconn.getGROUPS(req.session.udata.email, function(state){

            console.log(state);

            res.render('dashboard', {
                title: 'Dashboard',
                udata: req.session.udata,
                groups: state,
                alert: alert
            });
        });
    } else {
        res.redirect('/');
    }
});

/**GET user group**/
router.get('/grouproom/:gid', function(req, res, next){
    
})

/**POST user signin */
router.post('/user_signin', function(req, res, next){

    var auth = req.body.auth_method;

    if (auth == "form-auth"){
        var email = req.body.strEmail.toLowerCase();
        var passw = req.body.strPassw;
    }else if(auth == "firebase"){
        var payload = JSON.parse(req.body.strpayload);
        var email = payload.email;
    }else{
        console.log("invalid");
        res.redirect('/signin?notify=error');
    }


    dbconn.getUSER(email, function(state){
        //console.log(state);

        /**check if user exists */
        if(state != null){

            //form-auth
            if(state.auth.method == "form-auth"){
                //auth from email and password
                if(state.email == email && encrypt.compareHASH(passw, state.auth.passw)){
                    /**Create a user session */
                    sess = req.session;
                    sess.usersess = true;
                    req.session.usersess = true;
                    req.session.udata = {
                        email: state.email,
                        name: state.uname, 
                        uimg: state.u_img,
                        auth: state.auth.method,
                        univ: state.school
                    }

                    //console.log(req.session);
                    res.redirect('/dashboard');
                }else{
                    res.redirect('/signin?notify=passw');
                }
            }

            if(state.auth.method == "firebase"){
                //auth from email, provider and uid
                if(state.email == email && state.auth.uid == payload.uid && state.auth.providerID == payload.providerId){
                    /**Create a user session */
                    sess = req.session;
                    sess.usersess = true;
                    req.session.usersess = true;
                    req.session.udata = {
                        email: state.email,
                        name: state.uname, 
                        uimg: state.u_img,
                        auth: state.auth.method,
                        univ: state.school
                    }

                    //console.log(req.session);
                    res.redirect('/dashboard');
                }else{
                    res.redirect('/signin?notify=error');
                }
            }
        }else{
            res.redirect('/signin?notify=notfound');
        }
    });
});


/**POST user signup */
router.post('/user_signup', function(req, res, next){

    var auth = req.body.auth_method;

    if (auth == "form-auth"){
        //console.log("form auth");
        var email = req.body.strEmail.toLowerCase();
        var fname = req.body.strFname;
        var lname = req.body.strLname;

        var passw1 = req.body.strPassw1;
        var passw2 = req.body.strPassw2;

        //console.log(email, fname, lname, passw1);

        if(passw1 == passw2){
            //data to insert into the db
            data = {
                email: email,
                uname: fname + ' ' + lname,
                u_img: new Identicon(encrypt.passwHASH(email), Iden_options).toString('base64'),
                auth: {
                    method: "form-auth",
                    passw: encrypt.passwHASH(passw1)
                },
                school: null,
                groups: []
            }
        }else{
            //passwords not matched
            res.redirect('/signup?notify=passw');
        }

    }else if(auth == "firebase"){
        //console.log("firebase");
        var payload = JSON.parse(req.body.strpayload);

        if (payload != null){
            //console.log(payload);

            data = {
                email: payload.email,
                uname: payload.displayName,
                u_img: new Identicon(encrypt.passwHASH(payload.email), Iden_options).toString('base64'),
                auth: {
                    method: "firebase",
                    uid: payload.uid,
                    providerID: payload.providerId
                },
                school: null,
                groups: []
            }
        } else{
            res.redirect('/signup?notify=error');
        }
        
    }else{
        console.log("invalid");
        res.redirect('/signup?notify=error');
    }
    
    //console.log(data);

    /**Add data to db */
    dbconn.addUSER(data, function(state){
        if(state == 1){
            //console.log('Entered');
            res.redirect('/signup?notify=success');
        } else if(state == -1){
            //console.log('Duplicate');
            res.redirect('/signup?notify=duplicate');
        } else{
            //console.log('Error');
            res.redirect('/signup?notify=error');
        }
    });
});


/**GET user calendar */
router.get('/calendar', function(req, res, next){
    /**Makesure user session exists */
    if (req.session.usersess) {

        var alert = null;

        if(req.query.notify != null){
            alert = req.query.notify;
        }

        res.render('calendar', {
            title: 'Calendar',
            udata: req.session.udata,
            alert: alert
        });
    } else {
        res.redirect('/');
    }
});


/**GET user settings */
router.get('/settings', function(req, res, next){
    /**Makesure user session exists */
    if (req.session.usersess) {

        var alert = null;

        if(req.query.notify != null){
            alert = req.query.notify;
        }

        res.render('settings', {
            title: 'Settings',
            udata: req.session.udata,
            univ_list: univ_list,
            alert: alert
        });
    } else {
        res.redirect('/');
    }
});

/**GET user groups */
router.get('/groups', function(req, res, next){
    /**Makesure user session exists */
    if (req.session.usersess) {

        var alert = null;

        if(req.query.notify != null){
            alert = req.query.notify;
        }

        res.render('groups', {
            title: 'Groups',
            udata: req.session.udata,
            alert: alert
        });
    } else {
        res.redirect('/');
    }
});

/**GET user groups  /groupboard/:gid */
router.get('/groupboard', function(req, res, next){
    /**Makesure user session exists */
    if (req.session.usersess) {

        var alert = null;

        if(req.query.notify != null){
            alert = req.query.notify;
        }

        res.render('agileboard', {
            title: 'Group Board',
            udata: req.session.udata,
            alert: alert
        });
    } else {
        res.redirect('/');
    }
});

/**GET user groups  /groupchat/:gid */
router.get('/groupchat', function(req, res, next){
    /**Makesure user session exists */
    if (req.session.usersess) {

        var alert = null;

        if(req.query.notify != null){
            alert = req.query.notify;
        }

        res.render('agileboard', {
            title: 'Groups',
            udata: req.session.udata,
            alert: alert
        });
    } else {
        res.redirect('/');
    }
});


/** Dashboard actions **/
/** Update the user school **/
router.post('/school_update', function(req, res, next){
    //check school
    if (req.body.strSchool != 0){
        data = {
            school: req.body.strSchool,
            email: req.session.udata.email
        }

        dbconn.updateSCHOOL(data, function(state){
            //console.log(state);

            if(state == 1){
                //update the session
                req.session.udata.univ = data.school;
                res.redirect('/settings?notify=updates');
            }else{
                res.redirect('/settings?notify=error');
            }
        });
    }else{
        res.redirect('/settings');
    }
});

/** Update the user password **/
router.post('/passw_update', function(req, res, next){
    //update the users password
    if(req.body.strPassw1 ==  req.body.strPassw2){
        data = {
            passw: encrypt.passwHASH(req.body.strPassw1),
            email: req.session.udata.email
        }

        dbconn.getUSER(req.session.udata.email, function(state){
            if(state.email == data.email && encrypt.compareHASH(req.body.strOldpassw, state.auth.passw)){
                dbconn.updatePASSWD(data, function(state2){
                    if(state2 == 1){
                        res.redirect('/settings?notify=updates');
                    }else{
                        res.redirect('/settings?notify=error');
                    }
                })
            }else{
                res.redirect('/settings?notify=oldpassw');
            }
        });
    }else{
        res.redirect('/settings?notify=passw');
    }
});

/**create group**/
router.post('/create_group', function(req, res, next){

    data = {
        gname: req.body.groupName,
        email: req.session.udata.email,
        school: req.session.udata.univ
    }

    //create user group
    dbconn.createGROUP(data, function(state){
        if(state == 1){
            res.redirect('/groups?notify=added');
        }else{
            res.redirect('/groups?notify=error')
        }
    });
});

/**join group **/
router.post('/join_group', function(req, res, next){

});

/**search group**/
router.post('/search_group', function(req, res, next){

});


/**SIGNOUT*/
router.get('/signout', function(req, res, next) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;
