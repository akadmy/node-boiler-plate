'use strict';

exports.currentUnixTime = function () {
	return new Date().getTime();
};

exports.fifteenMinutesFromNow = function () {
	return (new Date().getTime()) + (15 * 60000);
};

exports.oneMinuteFromNow = function () {
	return (new Date().getTime()) + (1 * 60000);
};

exports.prettifyUnixTime = function (unxiTime) {
	var date = new Date(unxiTime*1000);
	// Hours part from the timestamp
	var hours = date.getHours();
	// Minutes part from the timestamp
	var minutes = "0" + date.getMinutes();
	// Seconds part from the timestamp
	var seconds = "0" + date.getSeconds();

	// Will display time in 10:30:23 format
	var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

	return formattedTime;
};