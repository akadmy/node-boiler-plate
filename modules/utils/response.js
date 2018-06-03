var method = Response.prototype;

function Response(status, data) {
	this._status = status;
	this._data = data;
}

method.get = function() {
	return {
		status: this._status,
		data: this._data
	}
};

module.exports = Response;