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
            callback(null);
        });
};

/**UPDATE user school**/
var updateSCHOOL = function(data, callback){
    //update school
    r.db(dbname).table(tbusers).get(data.email).update({
        school: data.school
    }).run()
    .then(function(response){
        if(response.replaced == 1){
            callback(1);
        }else{
            callback(0);
        }
    })
    .catch(function(err){
        callback(0);
    })
};

/**UPDATE user password **/
var updatePASSWD = function(data, callback){
    //update the users password
    r.db(dbname).table(tbusers).get(data.email).update({
        auth: {
            passw: data.passw
        }
    }).run()
    .then(function(response){
        if(response.replaced == 1){
            callback(1);
        }else{
            callback(0);
        }
    })
    .catch(function(err){
        callback(0);
    })
}

/**CREATE Group */
var createGROUP = function(data, callback){
    //console.log(data)

    //insert the group data
    r.db(dbname).table(tbgroups).insert({
        'groupname': data.gname,
        'owner': data.email,
        'school': data.school,
        'groupmembers': [data.email],
        'groupchat': [],
        'agileboard': {
            'todo': [],
            'progress': [],
            'review': [],
            'finished': []
        }
    }).run()
    .then(function(response){
        r.db(dbname).table(tbusers).get(data.email)
            .update({
                'groups': r.row('groups').append({
                    'groupid': response.generated_keys[0]
                })
            }).run()
        .then(function (resp){
            callback(1);
        })
        .catch(function(err){
            callback(0);
        })
    })
    .catch(function(err){
        callback(0);
    });
}

/**GET Groups */
var getGROUPS = function(useremail, callback){

    //console.log(useremail);

    //get users groups 
    var g = [];
    r.db(dbname).table(tbusers).get(useremail).getField('groups').run()
    .then(function(response){

        //console.log(response)

        //callback the group ids to user
        for(i = 0; i < response.length; i++){
            g.push(response[i].groupid);
        }

        //get data for each group from the groups table
        r.db(dbname).table(tbgroups).getAll(r.args(g)).run()
        .then(function(resp){
            callback(resp);
        })
        .catch(function(err){
            callback(null);
        });
    })
    .catch(function(err){   
        callback(null);
    });
}

/**GET specific group data*/
var groupDATA = function(groupid, callback){
    //get the requested group data including member info
    r.db(dbname).table(tbgroups).get(groupid).run()
    .then(function(response){
        //console.log(response.groupmembers);

        r.db(dbname).table(tbusers).getAll(r.args(response.groupmembers)).run()
        .then(function(resp){
            group_data = {
                group: response,
                users: resp
            }

            callback(group_data);
        })
        .catch(function(err){
            callback(null);
        })
    })
    .catch(function(err){
        console.log(err);
        callback(null)
    });
}

/**JOIN to to group**/
var joinGROUP = function(data, callback){
    //add the given id to user group
    r.db(dbname).table(tbusers).get(data.email).run()
    .then(function(response){
        //get current users 
        var usergroups = response.groups;
        var found = false;

        //go through arr and check user is already in the given group
        for(i = 0; i < usergroups.length; i++){
            if(usergroups[i].groupid === data.gid)
                found = true;
        }

        if(found){
            //already in the given group
            callback(-1);
        }else{
            //add group to users and email to members
            r.expr([
                r.db(dbname).table(tbusers).get(data.email)
                .update({
                    'groups': r.row('groups').append({
                        'groupid': data.gid
                    })
                }),
                r.db(dbname).table(tbgroups).get(data.gid)
                .update({
                    'groupmembers': r.row('groupmembers').append(data.email)
                })]
            ).run()
            .then(function (resp){
                callback(1);
            })
            .catch(function(err){
                callback(0);
            })
        }
    })
    .catch(function(err){
        callback(0); 
    });
}

/** DELETE group **/
var deleteGROUP = function(data, callback){
    /**delete the given id and unsubscribe the members**/
    r.db(dbname).table(tbgroups).get(data.gid).delete().run()
    .then(function(response){
        //callback the deleted status
        if(response.deleted == 1){
            callback(1);
        }else{
            callback(0);
        }
    })  
    .catch(function(err){
        callback(0);
    });
}

/**ADD todo from agileboard*/
var addTODO = function(data, callback){
    /**append todo to specific group */
    r.db(dbname).table(tbgroups).get(data.gid).run()
    .then(function(response){

    })
    .catch(function(err){
        
    })
}

/**Export the modules */
module.exports.addUSER = addUSER;
module.exports.getUSER = getUSER;
module.exports.updateSCHOOL = updateSCHOOL;
module.exports.updatePASSWD = updatePASSWD;
module.exports.createGROUP = createGROUP;
module.exports.getGROUPS = getGROUPS;
module.exports.groupDATA = groupDATA;
module.exports.joinGROUP = joinGROUP;
module.exports.deleteGROUP = deleteGROUP;