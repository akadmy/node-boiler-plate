'use strict';

/**
 * Module dependencies
 */
var otps = require('../controllers/otps.server.controller');

module.exports = function (app) {
	// Otps Routes
	app.route('/v1/ping').get(otps.ping);
};