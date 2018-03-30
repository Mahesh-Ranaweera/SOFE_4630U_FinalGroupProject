/**
 * Handles database connections
 */

var connection = null;
var r = require('rethinkdbdash')({
    port: 28015,
    host: 'localhost'
}, function(err, conn) {
    if (err) throw err;
    connection = conn;
});

/**DB tables */
var dbname = "web_db";
var tbusers = "users";
var tbgroups= "groups";

/**Setting up the app tables */
// create user table
r.dbList().contains(dbname)
    .do(function(dbExists) {
        return r.branch(
            dbExists, {
                dbs_created: 0
            },
            r.dbCreate(dbname)
        );
    }).run();

/**Create table users */
r.db(dbname).tableList().contains(tbusers)
    .do(function(dbTableExists) {
        return r.branch(
            dbTableExists, {
                tables_created: 0
            },
            r.db(dbname).tableCreate(tbusers, {
                primaryKey: 'email'
            }));
    }).run();

/**Create table groups */
r.db(dbname).tableList().contains(tbgroups)
    .do(function(dbTableExists) {
        return r.branch(
            dbTableExists, {
                tables_created: 0
            },
            r.db(dbname).tableCreate(tbgroups, {
                primaryKey: 'groupid'
            }));
    }).run();

/**USER signup */
var addUSER = function(data, callback) {
    //check if email exists
    r.db(dbname).table(tbusers).get(data.email).run()
        .then(function(response) {
            if (response == null) {
                console.log('user not exists');

                //insert the new user
                r.db(dbname).table(tbusers).insert(data).run();

                callback(1);
            } else {
                console.log('user found');
                callback(-1);
            }
        }).catch(function(err) {
            callback(0);
        });
};

/**USER  getuser*/
var getUSER = function(useremail, callback){
    //get user data based on user email
    r.db(dbname).table(tbusers).get(useremail).run()
        .then(function(response){
           // console.log(response);

            if(response == null){
                callback(null);
            }else{
                callback(response);
            }
        }).catch(function(err){
            console.log(err);
        });
}


/**Export the modules */
module.exports.addUSER = addUSER;
module.exports.getUSER = getUSER;