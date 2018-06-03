var method = Status.prototype;

function Status(isSuccess, httpCode, message) {
	this._isSuccess = isSuccess;
	this._httpCode = httpCode;
	this._message = message;
}

method.get = function() {
	return {
		success: this._isSuccess,
		code: this._httpCode,
		message: this._message
	};
};

module.exports = Status;