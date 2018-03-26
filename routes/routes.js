var express = require('express');
var router = express.Router();
var session = require('express-session');

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

    res.render('signup', {
        title: 'Signup',
        alert: alert
	});
});


/**GET user dashboard */
router.get('/dashboard', function(req, res, next){

});


/**POST user signin */
router.post('/user_signin', function(req, res, next){

});


/**POST user signup */
router.post('/user_signup', function(req, res, next){

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
