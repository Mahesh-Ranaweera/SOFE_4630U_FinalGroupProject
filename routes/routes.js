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
        username = req.session.name;
        useremail = req.session.email;
        uimg = req.session.uimg;

        var alert = null;

        if(req.query.notify != null){
            alert = req.query.notify;
        }

        res.render('dashboard', {
            title: 'Dashboard',
            name: username,
            uemail: useremail,
            uimg: uimg,
            alert: alert
        });
    } else {
        res.redirect('/');
    }
});


/**POST user signin */
router.post('/user_signin', function(req, res, next){
    var email = req.body.strEmail.toLowerCase();
    var passw = req.body.strPassw;

    dbconn.getUSER(email, function(state){
        //console.log(state);

        /**check if user exists */
        if(state != null){
            if(state.email == email && encrypt.compareHASH(passw, state.passw)){
                /**Create a user session */
                sess = req.session;
                sess.usersess = true;
                req.session.usersess = true;
                req.session.email = state.email;
                req.session.name = state.fname + ' ' + state.lname;
                req.session.uimg = state.u_img;

                //console.log(req.session);
                res.redirect('/dashboard');
            }else{
                res.redirect('/signin?notify=passw');
            }
        }else{
            res.redirect('/signin?notify=notfound');
        }
    });
});


/**POST user signup */
router.post('/user_signup', function(req, res, next){
    var email = req.body.strEmail.toLowerCase();
    var fname = req.body.strFname;
    var lname = req.body.strLname;
    var school= req.body.strUniversity;

    var passw1 = req.body.strPassw1;
    var passw2 = req.body.strPassw2;

    if(passw1 == passw2){
        //console.log('login');

        //data to insert into user
        data = {
            email: email,
            fname: fname,
            lname: lname,
            school: school,
            u_img: new Identicon(encrypt.passwHASH(email), Iden_options).toString('base64'),
            passw: encrypt.passwHASH(passw1)
        }

        console.log(data);


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
    }else{
        res.redirect('/signup?notify=passw');
}
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
