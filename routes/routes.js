var express = require('express');
var router = express.Router();
var session = require('express-session');
var multer = require('multer');

var dbconn = require('../app/db');
var encrypt = require('../app/encrypt');
var univ_list = require('../app/univ_list.json');
var Identicon= require('identicon.js');

router.use(multer({
    dest: 'temp/' 
}).any());

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

        //get the groups for the user
        dbconn.getGROUPS(req.session.udata.email, function(state){

            //console.log(state);

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
                    req.session.gdata = null;

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
                    req.session.gdata = null;

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
            res.redirect('/signin');
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

        dbconn.getGROUPS(req.session.udata.email, function(state){
            res.render('calendar', {
                title: 'Calendar',
                udata: req.session.udata,
                groups: state,
                alert: alert
            });
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

        //get the groups for the user
        dbconn.getGROUPS(req.session.udata.email, function(state){
            res.render('groups', {
                title: 'Groups',
                udata: req.session.udata,
                groups: state,
                alert: alert
            });
        });
    } else {
        res.redirect('/');
    }
});

/**SET the session for the group**/
router.get('/grouproom/:gid', function(req, res, next){
    //console.log(req.params.gid);
    /*makesure session exists*/
    if(req.session.usersess){
        //get the data of group
        req.session.gdata = req.params.gid;
        res.redirect('/groupboard')
    }else{
        res.redirect('/');
    }
});

/**GET user groups  /groupboard/:gid */
router.get('/groupboard', function(req, res, next){
    /**Makesure user session exists */
    if (req.session.usersess && req.session.gdata != null) {

        console.log('Curr Group session', req.session.gdata);

        var alert = null;

        if(req.query.notify != null){
            alert = req.query.notify;
        }

        dbconn.groupDATA(req.session.gdata, function(state){
            res.render('agileboard', {
                title: 'Group Board',
                udata: req.session.udata,
                gdata: state,
                alert: alert
            });
        });
    } else {
        res.redirect('/');
    }
});

/**GET group chat */
router.get('/chat', function(req, res, next){
    /**Makesure user session exists */
    if (req.session.usersess && req.session.gdata != null) {

        console.log('Curr Group session', req.session.gdata);

        var alert = null;

        if(req.query.notify != null){
            alert = req.query.notify;
        }

        dbconn.groupDATA(req.session.gdata, function(state){
             res.render('chat', {
                title: 'Group Chat',
                udata: req.session.udata,
                gdata: state,
                alert: alert
            });
        });
    } else {
        res.redirect('/');
    }
});

/**GET group chat */
router.get('/chatroom', function(req, res, next){
    /**Makesure user session exists */
    if (req.session.usersess && req.session.gdata != null) {

        console.log('Curr Group session', req.session.gdata);

        var alert = null;

        if(req.query.notify != null){
            alert = req.query.notify;
        }

        dbconn.groupDATA(req.session.gdata, function(state){
             res.render('chatroom', {
                title: 'Group Chat',
                udata: req.session.udata,
                gdata: state,
                alert: alert,
                roomCode: req.query.id
            });
        });
    } else {
        res.redirect('/');
    }
});

/**GET group members */
router.get('/groupmembers', function(req, res, next){
    /**Makesure user session exists */
    if (req.session.usersess && req.session.gdata != null) {

        var alert = null;

        if(req.query.notify != null){
            alert = req.query.notify;
        }

        dbconn.groupDATA(req.session.gdata, function(state){
            //get all members who are in the same school
            dbconn.getUNIVMEM(state.group.school, function(state2){

                // //loop curr members
                for(i = 0; i < state.group.groupmembers.length; i++){
                    for(j = 0; j < state2.length; j++){
                        //check emails are the same, if same remove them
                        if(state.group.groupmembers[i] == state2[j].email){
                            //console.log("found");
                            //remove found items
                            state2.splice(j, 1);
                        }
                    }
                }

                res.render('groupmembers', {
                    title: 'Group Members',
                    udata: req.session.udata,
                    gdata: state,
                    schoolusers: state2,
                    alert: alert
                });
            })
        });
    } else {
        res.redirect('/');
    }
});


/**GET groupdocs page**/
router.get('/groupdocs', function(req, res, next){
    /**Makesure user session exists **/
    if (req.session.usersess && req.session.gdata != null) {

        console.log('Curr Group session', req.session.gdata);

        var alert = null;

        if(req.query.notify != null){
            alert = req.query.notify;
        }

        dbconn.groupDATA(req.session.gdata, function(state){
             res.render('groupdocs', {
                title: 'Group Docs',
                udata: req.session.udata,
                gdata: state,
                docs: 'docs',
                alert: alert
            });
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

    //makesure university is set
    if(req.session.udata.univ != null){

        //create user group
        dbconn.createGROUP(data, function(state){
            if(state == 1){
                res.redirect('/groups?notify=added');
            }else{
                res.redirect('/groups?notify=error')
            }
        });
    }else{
        res.redirect('/groups?notify=univerr')
    }
});

/**join group **/
router.post('/join_group', function(req, res, next){

    data = {
        gid: req.body.groupID,
        email: req.session.udata.email
    }

    //validate the id
    if(data.gid.length == 36){
        //join given id
        dbconn.joinGROUP(data, function(state){
            console.log(state);

            if(state == 1){
                res.redirect('/groups?notify=added');
            }else if(state == -1){
                res.redirect('/groups?notify=registered');
            }else{
                res.redirect('/groups?notify=error');
            }
        })
    }else{
        res.redirect('/groups?notify=invalidid');
    }
});

/**search group**/
router.post('/search_group', function(req, res, next){

});

/**Delete group **/
router.post('/delete_group', function(req, res, next){

    data = {
        gid: req.body.strGID,
        email: req.session.udata.email
    }

    //delete the group
    dbconn.deleteGROUP(data, function(state){
        if(state == 1){
            res.redirect('/groups?notify=deleted');
        }else{
            res.redirect('/groups?notify=error');
        }
    })
});

/**Remove member**/
router.post('/remove_member', function(req, res, next){

    data = {
        gid: req.session.gdata,
        email: req.body.strEmail
    }

    //delete the member
    dbconn.deleteMEMBER(data, function(state){
        if(state == 1){
            res.redirect('/groupmembers?notify=deleted');
        }else{
            res.redirect('/groupmembers?notify=error');
        }
    });
})

//**Add member**/
router.post('/add_member', function(req, res, next){

    data = {
        gid: req.session.gdata,
        email: req.body.strEmail
    }

    dbconn.addMEMBER(data, function(state){
        if(state == 1){
            res.redirect('/groupmembers?notify=added');
        }else{
            res.redirect('/groupmembers?notify=error');
        }
    });
})

//**Leave from group**/
router.post('/leave_group', function(req, res, next){

    data = {
        gid: req.session.gdata,
        email: req.body.strEmail
    }

    dbconn.deleteMEMBER(data, function(state){
        if(state == 1){
            res.redirect('/dashboard');
        }else{
            res.redirect('/groupmembers?notify=error');
        }
    });
})

/**File upload**/
router.post('/file_upload', function(req, res, next){
    if(req.files){
        console.log(req.files);
        //limit the upload file size to 5MB
        if(req.files.size <= 5000){

            res.redirect('/groupdocs?notify=uploaded');
        }else{
            res.redirect('/groupdocs?notify=largef');
        }
    }else{
        res.redirect('/groupdocs');
    }
})

/**task complete todo upgrade**/
router.post('/task_complete', function(req, res, next){
    data = JSON.parse(req.body.strPayload);

    dbconn.upgradeTODO(data, function(state){

        console.log(state);
        if(state == 1){
            res.redirect('/calendar');
        }else{
            res.redirect('/calendar');
        }
    })
})

/**SIGNOUT*/
router.get('/signout', function(req, res, next) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.render('signout');
        }
    });
});

module.exports = router;
