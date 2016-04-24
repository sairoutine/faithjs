'use strict';

var _ = require('lodash');
var Register = require('./base');

var RegisterWithCallback = function(id, caller, callbackLoading, callbackStoring) {
	Register.apply(this, arguments);

	this.caller = caller;
	this.id = id;

	this.callbackLoading = callbackLoading;
	this.callbackStoring = callbackStoring;
};

// 基底クラスを継承
_.extend(RegisterWithCallback.prototype, Register.prototype);
_.extend(RegisterWithCallback, Register);

RegisterWithCallback.prototype.store = function(value, skip) {
	Register.prototype.store.apply(this, arguments);

	if(this.callbackStoring === true && skip !== true) {
		this.caller.notifyRegisterStoring(this.id);
	}
};


module.exports = RegisterWithCallback;
