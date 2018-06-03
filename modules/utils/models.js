/**
 * Require all models schema here
 * @type {{}}
 */

var mongoose = require('mongoose');

module.exports = {
	mongoose: require('mongoose'),
	Otp: mongoose.model('Otp')
};