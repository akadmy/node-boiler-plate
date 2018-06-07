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
	}
});

mongoose.model('Otp', OtpSchema);
