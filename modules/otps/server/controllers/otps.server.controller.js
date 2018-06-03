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

/**
 * @param req
 * @param res
 */
exports.generateOtp = function (req, res) {
  var length = req.params.length;
  var contactNumber = req.params.contactNumber;

  var matchQuery = {contactNumber: contactNumber};
  Otp.findOne(matchQuery, function (err, otpCd) {
	  if (err) {
		  var message = errorHandler.getErrorMessage(err);
		  var status = new Status(false, httpStatus.serverError, message).get();
		  var response = new Response(status, null);
		  return res.status(httpStatus.serverError).json(response.get());
	  }  else {
	  	var otp;
	  	var validity;
	  	var currentTime = time.currentUnixTime();
	  	if (otpCd)
	  		console.log('time diff ' + Math.abs((currentTime - otpCd.validity)/60000));
	  	if (otpCd && Math.abs(currentTime - otpCd.validity)/60000 < 1) {
	  		console.log('time diff ' + Math.abs((currentTime - otpCd.validity)/60000));
	  		console.log('time less than 1 mins : ' + Math.abs((currentTime - otpCd.validity)/60000));
			otp = otpCd.otp;
			validity = time.currentUnixTime();
		} else {
	  		console.log('time > 1 mins');
			var min = Math.pow(10, length-1);
			var max = min * 9;
			otp = Math.floor(min + Math.random() * max);
			validity = time.currentUnixTime();
			updateOtp(contactNumber, otp, null);
		}
		  if (settings.sms.twilio.isActive) {
			  sendTwilioOtp(otp, contactNumber, validity, function (err) {
				  if (err) {
					  var message = err;
					  var status = new Status(false, httpStatus.serverError, message).get();
					  var response = new Response(status, null);
					  return res.status(httpStatus.serverError).json(response.get());
				  } else {
					  var message = 'OTP Successfully generated';
					  var otpMessage = {
						  otp: otp
					  };
					  console.log(otp);
					  var status = new Status(false, httpStatus.success, message).get();
					  var response = new Response(status, null);
					  return res.status(httpStatus.success).json(response.get());
				  }
			  });
		  } else {
			  // Use 2 factor auth
			  twoFactorOtp(otp, contactNumber, validity, function (err) {
				  if (err) {
					  var message = err;
					  var status = new Status(false, httpStatus.serverError, message).get();
					  var response = new Response(status, null);
					  return res.status(httpStatus.serverError).json(response.get());
				  } else {
					  var message = 'OTP Successfully generated';
					  var otp = {
						  otp: otp
					  };
					  var status = new Status(false, httpStatus.success, message).get();
					  var response = new Response(status, null);
					  return res.status(httpStatus.success).json(response.get());
				  }
			  });
		  }
	  }
  });
};

/**
 * @description Save the otp entry
 * @param contactNumber
 * @param otp
 */
var updateOtp = function (contactNumber, otp, verifiedOn) {
	var matchQuery = {contactNumber: contactNumber};
	var updateQuery = {
		otp: otp,
		validity: time.oneMinuteFromNow(),
		verifiedOn: verifiedOn
	};
	var options = {upsert: true};

	Otp.findOneAndUpdate(matchQuery, updateQuery, options, function (err, otp) {
		if (err) {
			console.log(err);
		} else {
			console.log('OTP saved');
		}
	});
};

/**
 * @description Send OTP from twilio
 * @param otp
 * @param contactNumber
 * @param callback
 */
var sendTwilioOtp = function (otp, contactNumber, validity, callback) {
	var client = require('twilio')(settings.sms.twilio.accountNumber, settings.sms.twilio.authToken);
	client.messages.create({
		to: contactNumber,
		from: settings.sms.twilio.fromNumber,
		body: otp + ": is your otp and is valid till - " + validity
	}, function(err, message) {
		if (err) {
			callback(err);
		} else {
			callback(null, message);
		}
	});
};

/**
 * @description Send OTP from 2factorAuth
 * @param otp
 * @param contactNumber
 * @param callback
 */
var twoFactorOtp = function (otp, contactNumber, validity, callback) {
	var qs = require("querystring");

	var options = {
	  "method": 'POST',
	  "hostname": '2factor.in',
	  "port": null,
	  "path": '/API/V1/' + settings.sms.twoFactorAuth.apiKey + '/SMS/'+ contactNumber +'/' + otp,
	  "headers": {}
	};

	var req = http.request(options, function (res) {
	  var chunks = [];

	  res.on("data", function (chunk) {
	    chunks.push(chunk);
	  });

	  res.on("end", function () {
	    var body = Buffer.concat(chunks);
	    callback(null);
	  });
	});

	req.end();
};

/**
 * Verify user otp
 * @param req
 * @param res
 */
exports.verifyOtp = function (req, res) {
	var otp = req.params.otp;
	var contactNumber = req.params.contactNumber;

	var matchQuery = {contactNumber: contactNumber, otp: parseInt(otp)};
	// console.log(matchQuery);
	var updateQuery = {isVerified: true};
	Otp.findOneAndUpdate(matchQuery, updateQuery, function (err, otpData) {
		if (err) {
			var message = err;
			var status = new Status(false, httpStatus.serverError, message).get();
			var response = new Response(status, null);
			return res.status(httpStatus.serverError).json(response.get());
		} else {
			var currentTime = time.currentUnixTime();
			// console.log(Math.abs((currentTime - otpData.validity)/60000));
			if (otpData) {
				if (((currentTime - otpData.validity)/60000) > 1) {
					console.log((currentTime - otpData.validity)/60000);
					var message = 'OTP expired. Request new OTP';
					var status = new Status(false, httpStatus.badRequest, message).get();
					var response = new Response(status, {});
					return res.status(httpStatus.badRequest).json(response.get());
				} else {
					console.log(Math.abs((currentTime - otpData.validity)/60000));
					updateOtp(contactNumber, otp, time.currentUnixTime());
					var message = 'OTP verified';
					var status = new Status(false, httpStatus.success, message).get();
					var response = new Response(status, {});
					return res.status(httpStatus.success).json(response.get());
				}
			} else {
				var message = 'OTP verification failed. Try again.'
				var status = new Status(false, httpStatus.badRequest, message).get();
				var response = new Response(status, {});
				return res.status(httpStatus.badRequest).json(response.get());
			}
		}
	})
};

/**
 * @description Checks if a given number is verified or not
 * @param req
 * @param res
 */
exports.checkIfVerified = function (req, res) {
	var contactNumber = req.params.contactNumber;
	var matchQuery = {contactNumber: contactNumber, isVerified: true};
	Otp.findOne(matchQuery, function (err, otps){
		if (err) {
			var message = err;
			var status = new Status(false, httpStatus.serverError, message).get();
			var response = new Response(status, null);
			return res.status(httpStatus.serverError).json(response.get());
		} else {
			if (otps) {
				var currentTime = time.currentUnixTime();
				if (otps.verifiedOn) {
					var timeDiffMins = Math.abs((currentTime - otps.verifiedOn)/60000);
					if (timeDiffMins > 5) {
						var message = 'Please verify your contact number again';
						var status = new Status(false, httpStatus.badRequest, message).get();
						var response = new Response(status, null);
						return res.status(httpStatus.badRequest).json(response.get());
					}
				}
				var message = 'Contact number is verified';
				var status = new Status(false, httpStatus.success, message).get();
				var response = new Response(status, null);
				return res.status(httpStatus.success).json(response.get());
			} else {
				var message = 'Contact number not verified';
				var status = new Status(false, httpStatus.badRequest, message).get();
				var response = new Response(status, null);
				return res.status(httpStatus.badRequest).json(response.get());
			}
		}
	});
}