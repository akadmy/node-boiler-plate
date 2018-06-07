'use strict';

var path = require('path');
var commons = require(path.resolve('./modules/utils/commons'));
var models = require(path.resolve('./modules/utils/models'));

var mongoose = models.mongoose;
var Otp = models.Otp;
var Status = commons.Status;
var Response = commons.Response;
var httpStatus = commons.httpStatus;
var errorHandler = commons.errorHandler;
var passport = commons.passport;
var time = commons.time;
var http = require("https");
var _ = commons._;

var settings = require(path.resolve('./config/env/'+process.env.NODE_ENV));

/**
 * @description Ping Pong Message
 * @param req
 * @param res
 */
exports.ping = function (req, res) {
	if (req.query.message) {
		res.status(httpStatus.success).json({
			status: {
				success: true,
				code: httpStatus.success,
				message: req.query.message
			}
		});
	} else {
		res.status(httpStatus.badRequest).json({
			status: {
				success: false,
				code: httpStatus.badRequest,
				message: 'message is a required get parameter'
			}
		});
	}
};