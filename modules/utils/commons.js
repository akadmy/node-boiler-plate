/**
 * All Commonly required files goes here
 * @type {{httpStatus: (*), Status: (*), Response: (*)}}
 */

var path = require('path');

module.exports = {
	httpStatus: require(path.resolve('./constants/http_status')),
	Status: require(path.resolve('./modules/utils/statusResponse')),
	Response: require(path.resolve('./modules/utils/response')),
	time: require(path.resolve('./modules/utils/time')),
	passport: require('passport'),
	_: require('lodash'),
	errorHandler: require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
};