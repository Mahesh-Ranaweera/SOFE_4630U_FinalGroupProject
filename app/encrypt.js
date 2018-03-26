/**
 * Password hashing and salt gen
 */
var bcrypt = require('bcrypt');
/**Number of times salt is iterated */
var saltRounds = 10;

/**Hash the password to store in DB */
var passwHASH = function(passw) {
    return bcrypt.hashSync(passw, saltRounds);
}

/**Compare password with hash */
var compareHASH = function(passw, hash) {
    return bcrypt.compareSync(passw, hash);
}

/**Export the modules */
module.exports.passwHASH = passwHASH;
module.exports.compareHASH = compareHASH;