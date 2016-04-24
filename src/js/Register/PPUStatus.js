'use strict';

var _ = require('lodash');
var RegisterWithCallback = require('./WithCallback');

var PPUStatusRegister = function() {
	RegisterWithCallback.apply(this, arguments);

};
// 基底クラスを継承
_.extend(PPUStatusRegister.prototype, RegisterWithCallback.prototype);
_.extend(PPUStatusRegister, RegisterWithCallback);

module.exports = PPUStatusRegister;
