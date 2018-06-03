'use strict';

/**
 * Module dependencies
 */
var otps = require('../controllers/otps.server.controller');

module.exports = function (app) {
	// Otps Routes
	app.route('/v1/ping').get(otps.ping);
	app.route('/v1/otp/isverified/:contactNumber').get(otps.checkIfVerified);
	app.route('/v1/otp/generate/:contactNumber/:length').post(otps.generateOtp);
	app.route('/v1/otp/verify/:contactNumber/:otp').get(otps.verifyOtp);
};