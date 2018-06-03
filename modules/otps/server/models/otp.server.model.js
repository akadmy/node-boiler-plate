'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var path = require('path');
var commons = require(path.resolve('./modules/utils/commons'));
var time = commons.time;

/**
 * Otp Schema
 */
var OtpSchema = new Schema({
	contactNumber: {
		type: String,
		required: 'Please enter the contact number'
	},
	otp: {
		type: Number,
		required: 'Please enter the OTP'
	},
	validity: {
		type: String,
		required: 'Please enter the validity timestamp',
		default: time.currentUnixTime()
	},
	isVerified: {
		type: Boolean,
		default: false
	},
	verifiedOn: {
		type: String
	}
});

mongoose.model('Otp', OtpSchema);
